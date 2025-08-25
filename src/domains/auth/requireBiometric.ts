// src/auth/biometric/requireBiometric.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricResult } from './types';

export async function requireBiometric(promptMessage: string): Promise<BiometricResult> {
    const hasHW = await LocalAuthentication.hasHardwareAsync();
    const enrolled = hasHW && await LocalAuthentication.isEnrolledAsync();

    if (!hasHW || !enrolled) {
        return { ok: false, reason: 'no-biometric', fallbackToPin: true };
    }

    const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: true,
    });

    if (result.success) return { ok: true };

    const err = (result as any)?.error ?? 'unknown';
    switch (err) {
        case 'user_cancel':
        case 'system_cancel':
        case 'app_cancel':
            return { ok: false, reason: 'canceled' };
        case 'lockout':
        case 'lockout_permanent':
            return { ok: false, reason: 'lockout', fallbackToPin: true, retryAfterSec: 30 };
        case 'not_enrolled':
        case 'not_available':
            return { ok: false, reason: 'no-biometric', fallbackToPin: true };
        default:
            return { ok: false, reason: 'error', fallbackToPin: true };
    }
}
