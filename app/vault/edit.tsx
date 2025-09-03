// app/vault/edit.tsx
import { TYPES, VaultType } from '@/src/_constants/vaultTypes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createEmptyForm, FIELDS } from '../../src/_constants/_form';
import AppLayout from '../_components/AppLayout';
import TabChips, { TabItem } from '../_components/TabChips';

export default function VaultEditScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    // 🔧 편집은 서버의 기존 타입/폼값을 로딩해서 세팅
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState<VaultType>('account');
    const [form, setForm] = useState<Record<string, string>>(createEmptyForm('account'));
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 초기 로딩 (목업)
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                // TODO: GET /api/v1/vault/:id -> { type, fields }
                // 목업
                const mockType: VaultType = 'account';
                const mockValues: Record<string, string> = {
                    urlOrName: 'https://wooribank.com',
                    username: 'user@example.com',
                    password: 'secret',
                    note: 'OTP 필요',
                };
                setType(mockType);
                // 필드 키만 유지하면서 값 주입
                const base = createEmptyForm(mockType);
                Object.keys(base).forEach(k => { base[k] = mockValues[k] ?? ''; });
                setForm(base);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const canSubmit = useMemo(() => {
        const required: Partial<Record<VaultType, string[]>> = {
            account: ['urlOrName', 'username', 'password'],
            card: ['number', 'expiry', 'name', 'cvc'],
            id: ['name', 'regNo'],
            license: ['licenseName', 'licenseNo'],
            memo: ['title', 'body'],
            device: ['model', 'serial'],
            photo: ['title'],
            other: ['title', 'content'],
        };
        const req = required[type] ?? [];
        return req.every((k) => (form[k] ?? '').trim().length > 0);
    }, [form, type]);

    const update = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

    async function submit() {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const payload = { id, type, plaintext_demo_only_do_not_use_in_prod: form };
            const res = await fetch(`/api/v1/vault/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }).catch(() => ({ ok: true } as Response));
            if (!res.ok) throw new Error('서버 오류');
            Alert.alert('저장됨', '변경 사항이 저장되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
        } catch (e: any) {
            Alert.alert('실패', e?.message ?? '저장에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    }

    const renderIcon = (icon: (typeof TYPES)[number]['icon'], color = '#374151') => {
        if (icon === 'mdi:id') {
            return <MaterialCommunityIcons name="card-account-details-outline" size={16} color={color} />;
        }
        return <Ionicons name={icon as any} size={16} color={color} />;
    };

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: '개인정보 수정',
                onBackPress: () => router.back(),
            }}
        >
            {/* 편집에서는 타입 변경 금지(데이터 구조가 달라져서). 필요하면 아래 줄을 지우고 변경 허용 */}
            <TabChips items={(TYPES as TabItem[]).filter(t => t.key === type)} value={type} onChange={() => { }} />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAwareScrollView
                    extraHeight={Platform.OS === 'ios' ? 56 : 0}
                    extraScrollHeight={150}
                    enableOnAndroid
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={s.formAreaWrap}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[s.card, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                        <Text style={s.cardTitle}>기본 정보</Text>

                        {loading ? (
                            <Text style={{ color: '#666' }}>불러오는 중…</Text>
                        ) : (
                            FIELDS[type].map((f) => {
                                const isPassword = f.key === 'password';
                                const isSecure = !!f.secureTextEntry && !showPassword;
                                return (
                                    <View key={f.key} style={s.field}>
                                        <Text style={s.label}>{f.label}</Text>
                                        <View style={[s.inputRow, f.multiline && { height: undefined }]}>
                                            <TextInput
                                                style={[s.input, f.multiline && s.inputMultiline]}
                                                placeholder={f.placeholder}
                                                placeholderTextColor="#9aa1ab"
                                                value={form[f.key]}
                                                onChangeText={(t) => update(f.key, t)}
                                                keyboardType={f.keyboardType}
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                secureTextEntry={isSecure}
                                                multiline={!!f.multiline}
                                                textAlignVertical={f.multiline ? 'top' : 'center'}
                                                returnKeyType={f.multiline ? 'default' : 'next'}
                                            />
                                            {isPassword && (
                                                <Pressable onPress={() => setShowPassword((v) => !v)} style={s.eyeBtn} hitSlop={10}>
                                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#6b7280" />
                                                </Pressable>
                                            )}
                                        </View>
                                        {f.key === 'regNo' && <Text style={s.helper}>※ 주민등록번호 저장은 권장하지 않아요.</Text>}
                                    </View>
                                );
                            })
                        )}

                        <TouchableOpacity
                            style={[s.saveBtn, (!canSubmit || submitting) && { opacity: 0.5 }]}
                            disabled={!canSubmit || submitting}
                            onPress={submit}
                        >
                            <Text style={s.saveBtnText}>{submitting ? '저장중…' : '저장'}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
        </AppLayout>
    );
}

const s = StyleSheet.create({
    formAreaWrap: { flexGrow: 1, padding: 16, backgroundColor: '#f5f7fa' },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    },
    cardTitle: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 8 },
    field: { marginBottom: 14 },
    label: { color: '#222', marginBottom: 6, fontSize: 13, fontWeight: '700' },
    inputRow: { position: 'relative', justifyContent: 'center' },
    input: {
        height: 46, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#fff', color: '#222',
        borderWidth: 1, borderColor: '#e5e7eb',
    },
    inputMultiline: { minHeight: 90, paddingTop: 10, paddingBottom: 10 },
    eyeBtn: { position: 'absolute', right: 10, height: 44, justifyContent: 'center', alignItems: 'center', width: 32 },
    helper: { marginTop: 6, color: '#6b7280', fontSize: 12 },
    saveBtn: {
        marginVertical: 12, height: 48, borderRadius: 12, backgroundColor: '#2563eb',
        alignItems: 'center', justifyContent: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
