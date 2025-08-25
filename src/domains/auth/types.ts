// src/auth/biometric/types.ts
export type BiometricResult =
  | { ok: true }
  | { ok: false; reason: 'no-biometric' | 'canceled' | 'lockout' | 'error'; fallbackToPin?: boolean; retryAfterSec?: number };
