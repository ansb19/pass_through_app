// src/auth/biometric/useBiometric.ts
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { requireBiometric } from '../src/domains/auth/requireBiometric';
import type { BiometricResult } from '../src/domains/auth/types';

export function useBiometric() {
    const { t } = useTranslation('auth');

    const authenticate = useCallback(async (): Promise<BiometricResult> => {
        return await requireBiometric(t('biometric_prompt'));
    }, [t]);

    return { authenticate };
}
