import { ENV } from '@core/config/env';
import { Secure } from '@core/storage/secureStore';
import { getAppVersion, getDeviceId, getDeviceInfo } from '@core/utils/device';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { AppError, toApiError } from './errors';

let instance: AxiosInstance | null = null;
let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

async function refreshToken(): Promise<string | null> {
    const refresh = await Secure.get('REFRESH_TOKEN');
    if (!refresh) return null;
    try {
        const res = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, { refresh });
        const newToken = res.data?.accessToken as string | undefined;
        if (newToken) await Secure.set('SESSION_ID', newToken);
        return newToken ?? null;
    } catch {
        return null;
    }
}

export function http(): AxiosInstance {
    if (instance) return instance;

    instance = axios.create({
        baseURL: ENV.API_BASE_URL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
    });

    instance.interceptors.request.use(async (config) => {
        const [sessionId, deviceBind, deviceId] = await Promise.all([
            Secure.get('SESSION_ID'),
            Secure.get('DEVICE_BIND'),
            getDeviceId(),                // ✅ 반드시 호출! () 잊지 말기
        ]);

        // ✅ Axios v1 타입 안전하게: 존재 안하면 새로 만들고, 키별 세팅
        config.headers = config.headers ?? {};

        // Authorization
        if (sessionId) {
            (config.headers as any).Authorization = `Bearer ${sessionId}`;
        } else {
            // 일부 플랫폼에서 undefined 할당을 싫어함 → 아예 지우기
            delete (config.headers as any).Authorization;
        }

        // Custom headers
        (config.headers as any)['X-Device-Id'] = deviceId ?? 'unknown';
        (config.headers as any)['X-Device-Bind'] = deviceBind ?? '';
        (config.headers as any)['X-App-Version'] = getAppVersion();
        (config.headers as any)['X-Device-Info'] = getDeviceInfo();
        (config.headers as any)['X-Request-Id'] =
            (globalThis as any)?.crypto?.randomUUID?.() ?? String(Date.now());

        // Content-Type 보강 (혹시 누락되어 있으면)
        if (!(config.headers as any)['Content-Type']) {
            (config.headers as any)['Content-Type'] = 'application/json';
        }

        return config;
    });

    instance.interceptors.response.use(undefined, async (error: AxiosError) => {
        const cfg: any = error.config ?? {};
        const status = error.response?.status;

        // 401 → refresh 큐
        if (status === 401 && !cfg._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pending.push((newToken) => {
                        if (!newToken) return reject(toApiError(error));
                        cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${newToken}` };
                        cfg._retry = true;
                        resolve(instance!.request(cfg));
                    });
                });
            }
            isRefreshing = true;
            cfg._retry = true;

            try {
                const newToken = await refreshToken();
                pending.forEach((fn) => fn(newToken));
                pending = [];
                if (!newToken) throw error;
                cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${newToken}` };
                return instance!.request(cfg);
            } finally {
                isRefreshing = false;
            }
        }

        // 네트워크/5xx 간단 재시도(최대 2회)
        const retriable = !status || (status >= 500 && status < 600) || error.code === 'ECONNABORTED';
        cfg._retryCount = cfg._retryCount ?? 0;
        if (retriable && cfg._retryCount < 2) {
            cfg._retryCount++;
            const delay = 300 * Math.pow(2, cfg._retryCount - 1);
            await new Promise((r) => setTimeout(r, delay));
            return instance!.request(cfg);
        }

        const appErr: AppError = toApiError(error);
        return Promise.reject(appErr);
    });

    return instance;
}
