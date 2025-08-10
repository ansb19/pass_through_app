// utils/validation.ts
export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 한국 휴대폰: 010/011/016/017/018/019 + 총 10~11자리
export const phoneRe = /^01[016789]\d{7,8}$/;

export const sanitizeNickname = (s: string) =>
  s.replace(/[^\p{L}\p{N}\s]/gu, '').slice(0, 20);

export const sanitizeDigits = (s: string, maxLen: number) =>
  s.replace(/\D/g, '').slice(0, maxLen);

export const isNicknameValid = (v: string) => v.length > 0 && v.length <= 20;
export const isBirthValid = (v: string) => /^\d{8}$/.test(v);
export const isEmailValid = (v: string) => emailRe.test(v);
export const isPhoneValid = (v: string) => phoneRe.test(v);
