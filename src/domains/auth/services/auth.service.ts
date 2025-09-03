import { EncBundle, unwrapMasterKeyWithPin } from '@/src/core/crypto/keystore';
import { Secure } from '@/src/core/storage/secureStore';
import { requireBiometric } from '@/src/domains/auth/requireBiometric';
import { ApiResult } from '@core/http/types';
import { AuthApi, LoginEncRes } from '../api/auth.api';

export const AuthService = {
  /**
   * 로그인 (PIN + 생체 인증)
   */
  login: async (
    userId: string,
    deviceBind: string,
    pin: string,
    useBiometric: boolean
  ): Promise<ApiResult<true>> => {
    try {
      // 1) 서버에서 enc 번들 가져오기
      let enc: LoginEncRes;
      try {
        enc = await AuthApi.loginEnc(userId, deviceBind);
      } catch (e: any) {
        return {
          ok: false,
          code: e.code ?? 'LOGIN_ENC_FAIL',
          message: e.message ?? 'enc 번들 요청 실패',
          status: e.status,
        };
      }

      // 2) PIN으로 복호화 시도
      try {
        await unwrapMasterKeyWithPin(pin, toEncBundle(enc));
      } catch {
        return {
          ok: false,
          code: 'INVALID_PIN',
          message: '잘못된 PIN 입니다.',
        };
      }

      // 3) 생체 인증
      if (useBiometric) {
        const bio = await requireBiometric('생체 인증을 진행해주세요');
        if (!bio.ok) {
          return {
            ok: false,
            code: 'BIOMETRIC_FAIL',
            message: '생체 인증 실패',
          };
        }
      }

      // 4) PIN & 생체 인증 통과 → 토큰 발급
      try {
        await AuthApi.issueToken(userId);
      } catch (e: any) {
        return {
          ok: false,
          code: e.code ?? 'ISSUE_TOKEN_FAIL',
          message: e.message ?? '토큰 발급 실패',
          status: e.status,
        };
      }

      // 5) 성공 시 userId 저장
      await Secure.set('USER_ID', userId);

      return { ok: true, data: true };
    } catch (e: any) {
      return {
        ok: false,
        code: e.code ?? 'LOGIN_FAIL',
        message: e.message ?? '로그인 실패',
        status: e.status,
      };
    }
  },

  /**
   * 로그아웃
   */
  logout: async (userId: string): Promise<ApiResult<true>> => {
    try {
      await AuthApi.logout(userId);
      return { ok: true, data: true };
    } catch (e: any) {
      return {
        ok: false,
        code: e.code ?? 'LOGOUT_FAIL',
        message: e.message ?? '로그아웃 실패',
        status: e.status,
      };
    }
  },

  /**
   * 인증코드 전송 (SMS)
   */
  sendSmsCode: async (phone: string): Promise<ApiResult<{ success: boolean; ttl?: number }>> => {
    try {
      const data = await AuthApi.sendCode('sms', phone);
      return { ok: true, data };
    } catch (e: any) {
      return {
        ok: false,
        code: e.code ?? 'SEND_SMS_FAIL',
        message: e.message ?? 'SMS 인증코드 전송 실패',
        status: e.status,
      };
    }
  },

  /**
   * 인증코드 전송 (Email)
   */
  sendEmailCode: async (email: string): Promise<ApiResult<{ success: boolean; ttl?: number }>> => {
    try {
      const data = await AuthApi.sendCode('email', email);
      return { ok: true, data };
    } catch (e: any) {
      return {
        ok: false,
        code: e.code ?? 'SEND_EMAIL_FAIL',
        message: e.message ?? '이메일 인증코드 전송 실패',
        status: e.status,
      };
    }
  },

  /**
   * 인증코드 검증
   */
  verifyCode: async (
    type: 'sms' | 'email',
    identifier: string,
    code: string
  ): Promise<ApiResult<{ success: boolean }>> => {
    try {
      const data = await AuthApi.verifyCode(type, identifier, code);
      return { ok: true, data };
    } catch (e: any) {
      return {
        ok: false,
        code: e.code ?? 'VERIFY_FAIL',
        message: e.message ?? '인증코드 검증 실패',
        status: e.status,
      };
    }
  },
  
};
function toEncBundle(res: LoginEncRes): EncBundle {
  return {
    algo: res.algo as 'AES-GCM',
    kdf: res.kdf as 'PBKDF2',
    iterations: res.iterations,
    digest: res.digest as 'SHA-256',
    keyLength: res.keyLength,
    ciphertext_b64: res.ciphertext_b64,
    salt_b64: res.salt_b64,
    nonce_b64: res.nonce_b64,
    version: res.schemaVersion as 'v1', // 서버에서 안 주니 클라에서 기본값 세팅
  };
}