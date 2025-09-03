import { http } from '@core/http/http';
import { Secure } from '@core/storage/secureStore';

export type LoginEncRes = {
  algo: string;
  kdf: string;
  digest: string;
  iterations: number;
  keyLength: number;
  schemaVersion: string;
  ciphertext_b64: string;
  salt_b64: string;
  nonce_b64: string;
};

export type IssueTokenRes = {
  accessToken: string;
  refreshToken: string;
};

export const AuthApi = {
  /**
   * 로그인 1단계: enc 번들 가져오기
   */
  async loginEnc(userId: string, deviceBind: string): Promise<LoginEncRes> {
    const res = await http().post<LoginEncRes>('/auth/login-enc', {
      user_id: userId,
      device_bind: deviceBind,
    });
    return res.data;
  },

  /**
   * 로그인 2단계: PIN unwrap 성공 후 토큰 발급
   */
  async issueToken(userId: string): Promise<IssueTokenRes> {
    const res = await http().post<IssueTokenRes>('/auth/issue-token', {
      user_id: userId,
    });
    const { accessToken, refreshToken } = res.data;

    await Promise.all([
      Secure.set('SESSION_ID', accessToken),
      refreshToken ? Secure.set('REFRESH_TOKEN', refreshToken) : Promise.resolve(),
    ]);

    return res.data;
  },

  /**
   * 로그아웃
   */
  async logout(userId: string): Promise<void> {
    await http().post('/auth/logout', { user_id: userId });
    await Promise.all([Secure.del('SESSION_ID'), Secure.del('REFRESH_TOKEN')]);
  },

  /**
   * 인증 코드 발송 (이메일 or 휴대폰)
   */
  async sendCode(type: 'sms' | 'email', identifier: string): Promise<{ success: boolean; ttl?: number }> {
    const body: any = { type };
    if (type === 'sms') body.phone = identifier;
    if (type === 'email') body.email = identifier;

    const res = await http().post<{ success: boolean; ttl?: number }>('/auth/send-code', body);
    return res.data;
  },

  /**
   * 인증 코드 검증 (이메일 or 휴대폰)
   */
  async verifyCode(type: 'sms' | 'email', identifier: string, code: string): Promise<{ success: boolean }> {
    const body: any = { type, code };
    if (type === 'sms') body.phone = identifier;
    if (type === 'email') body.email = identifier;

    const res = await http().post<{ success: boolean }>('/auth/verify-code', body);
    return res.data;
  },
};
