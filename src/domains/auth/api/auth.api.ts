import { http } from '@core/http/http';
import { ApiResult } from '@core/http/types';
import { Secure } from '@core/storage/secureStore';

type LoginReq = { pin: string; otp?: string; biometric?: boolean };
type LoginRes = { accessToken: string; refreshToken?: string; deviceBind?: string };

export const AuthApi = {
    async login(body: LoginReq): Promise<ApiResult<{ userId: string }>> {
        try {
            const res = await http().post<LoginRes>('/auth/login', body);
            const { accessToken, refreshToken, deviceBind } = res.data;
            await Promise.all([
                Secure.set('SESSION_ID', accessToken),
                refreshToken ? Secure.set('REFRESH_TOKEN', refreshToken) : Promise.resolve(),
                deviceBind ? Secure.set('DEVICE_BIND', deviceBind) : Promise.resolve(),
            ]);
            return { ok: true, data: { userId: 'me' } };
        } catch (e: any) {
            return { ok: false, code: e.code, message: e.message, status: e.status };
        }
    },

    async logout(): Promise<ApiResult<true>> {
        try {
            await http().post('/auth/logout');
        } finally {
            await Promise.all([Secure.del('SESSION_ID'), Secure.del('REFRESH_TOKEN')]);
        }
        return { ok: true, data: true };
    },

    async sendCode(type: 'sms' | 'email', phone: string): Promise<ApiResult<{ success: boolean }>> {
        try {
            const res = await http().post('/auth/send-code', { type, phone });
            return { ok: true, data: res.data };
        } catch (e: any) {
            return { ok: false, code: e.code, message: e.message, status: e.status };
        }
    },
};
