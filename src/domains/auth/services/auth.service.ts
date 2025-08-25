import { AuthApi } from '../api/auth.api';

export const AuthService = {
  loginWithPinAndBiometric: (pin: string, biometric: boolean) =>
    AuthApi.login({ pin, biometric }),

  logout: () => AuthApi.logout(),
   sendSmsCode: (phone: string) => AuthApi.sendCode('sms', phone),
  sendEmailCode: (email: string) => AuthApi.sendCode('email', email),
};
