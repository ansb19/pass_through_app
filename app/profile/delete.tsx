// app/profile/delete.tsx
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppLayout from '../_components/AppLayout';

// TODO: 실제 세션에서 닉네임 가져오세요.
const getNickname = () => '게스트';

async function requestAccountDeletion(): Promise<void> {
    // TODO: 서버에 삭제 예약(soft-delete + deletion_scheduled_at=now+30d)
    await new Promise(r => setTimeout(r, 150));
}

const DELETION_DAYS = 30;

export default function DeleteAccountScreen() {
    const { t } = useTranslation('account_delete');
    const nickname = useMemo(() => getNickname(), []);
    const [input, setInput] = useState('');

    const onSubmit = async () => {
        if (input.trim() !== nickname.trim()) {
            Alert.alert(t('alert_mismatch_title'), t('alert_mismatch_desc'));
            return;
        }
        await requestAccountDeletion();
        // TODO: signOut() 호출 등 세션 정리
        Alert.alert(
            t('alert_done_title'),
            t('alert_done_desc', { days: DELETION_DAYS }),
            [{ text: t('ok'), onPress: () => router.replace('/welcome') }]
        );
    };

    return (
        <AppLayout showFooter={false} headerProps={{ title: t('title') }}>
            <View style={s.wrap}>
                <View style={s.card}>
                    <Text style={s.title}>{t('confirm_title')}</Text>
                    <Text style={s.text}>{t('confirm_desc')}</Text>
                    <Text style={s.warn}>
                        {t('warn_text', { days: DELETION_DAYS })}
                    </Text>

                    <Text style={s.label}>{t('label_nickname')}</Text>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder={t('ph_nickname', { nickname })}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={s.input}
                    />

                    <View style={s.row}>
                        <Pressable onPress={() => router.back()} style={[s.btn, s.btnGhost]} accessibilityRole="button">
                            <Text>{t('btn_cancel')}</Text>
                        </Pressable>
                        <Pressable onPress={onSubmit} style={[s.btn, s.btnDanger]} accessibilityRole="button">
                            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('btn_delete')}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </AppLayout>
    );
}

const s = StyleSheet.create({
    wrap: { flex: 1, padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10 },
    title: { fontSize: 18, fontWeight: '700', color: '#111' },
    text: { fontSize: 13, color: '#333' },
    warn: { fontSize: 13, color: '#ef4444' },
    label: { fontSize: 12, color: '#666', marginTop: 10 },
    input: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 14,
        backgroundColor: '#fafafa'
    },
    row: { flexDirection: 'row', gap: 10, marginTop: 12 },
    btn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 10 },
    btnGhost: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', backgroundColor: '#fff' },
    btnDanger: { backgroundColor: '#c1121f' }
});
