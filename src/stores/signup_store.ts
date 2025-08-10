import { create } from 'zustand';

export type SignupState = {
  // Step1에서 선택적으로 저장할 값들
  nickname?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;

  // Step2 (실행 중만 보관)
  pin?: string;

  // 업데이트
  setField: <K extends keyof SignupState>(key: K, value: SignupState[K]) => void;
  setMany: (patch: Partial<SignupState>) => void;

  // 민감값만 비우기(예: pin)
  clearSensitive: () => void;

  // 전체 초기화(가입 플로우 종료 시)
  reset: () => void;
};

export const useSignupStore = create<SignupState>((set) => ({
  nickname: undefined,
  birthDate: undefined,
  email: undefined,
  phone: undefined,
  pin: undefined,
  emailVerified: false,
  phoneVerified: false,

  setField: (key, value) => set({ [key]: value } as Partial<SignupState>),
  setMany: (patch) => set(patch),

  clearSensitive: () => set({ pin: undefined }),
  reset: () =>
    set({
      nickname: undefined,
      birthDate: undefined,
      email: undefined,
      phone: undefined,
      pin: undefined,
      emailVerified: false,
      phoneVerified: false,
    }),
}));
