// app/auth/reauth.tsx
import { requireBiometric } from '@/src/domains/auth/requireBiometric';
import type { Href } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import AppLayout from '../_components/AppLayout';
import PasscodePad from '../_components/PasscodePad';

type NextAllow = '/home' | '/profile/edit' | '/profile/delete';

async function verifyPin(pin: string): Promise<boolean> {
    // TODO: 서버 검증으로 교체 (POST /auth/verify-pin)
    await new Promise(r => setTimeout(r, 150));
    return pin.length === 6;
}

export default function ReauthScreen() {
    const { t } = useTranslation('reauth');
    const { next, title } = useLocalSearchParams<{ next?: string; title?: string }>();

    // 허용된 경로만 통과 (그 외는 /home)
    const allowSet = new Set<NextAllow>(['/home', '/profile/edit', '/profile/delete']);
    const nextPath: NextAllow = (typeof next === 'string' && allowSet.has(next as NextAllow))
        ? (next as NextAllow)
        : '/home';

    const handleComplete = async (pin: string) => {
        const ok = await verifyPin(pin);
        if (!ok) {
            Alert.alert(t('pin_invalid_title'), t('pin_invalid_msg'));
            return;
        }

        const bio = await requireBiometric(t('biometric_prompt'));
        if (!bio.ok) return;

        router.replace(nextPath as Href);
    };

    return (
        <AppLayout
            showFooter={false}
            headerProps={{ title: (title as string) || t('title_default') }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    <Text style={styles.helper}>{t('helper')}</Text>
                    <PasscodePad
                        title={t('pin_title')}
                        subtitle={t('pin_subtitle')}
                        pinLength={6}
                        randomize
                        fakePress
                        onComplete={handleComplete}
                    />
                </View>
            </KeyboardAvoidingView>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingTop: 24 },
    helper: { fontSize: 13, color: '#555', marginBottom: 12 },
});
