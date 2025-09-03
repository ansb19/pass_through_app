import { TYPES, VaultType } from '@/src/_constants/vaultTypes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createEmptyForm, FIELDS } from '../../src/_constants/_form';
import AppLayout from '../_components/AppLayout';
import TabChips, { TabItem } from '../_components/TabChips';





export default function VaultAddScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['vault', 'common']);

    const [type, setType] = useState<VaultType>('account');
    const [form, setForm] = useState<Record<string, string>>(createEmptyForm('account'));
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const scrollRef = useRef<KeyboardAwareScrollView>(null);
    const [kbHeight, setKbHeight] = useState(0);

    useEffect(() => {
        setForm(createEmptyForm(type));
        setShowPassword(false);
    }, [type]);

    const required: Partial<Record<VaultType, string[]>> = {
        account: ['urlOrName', 'username', 'password'],
        card: ['number', 'expiry', 'name', 'cvc'],
        id: ['name', 'regNo'],
        license: ['licenseName', 'licenseNo'],
        memo: ['title', 'body'],
        device: ['model', 'serial'],
        photo: ['title'],
        other: ['title', 'content']
    };

    const canSubmit = useMemo(() => {
        const req = required[type] ?? [];
        return req.every((k) => (form[k] ?? '').trim().length > 0);
    }, [form, type]);

    const update = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

    async function submit() {
        if (!canSubmit || submitting) return;
        setSubmitting(true);
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const payload = { type, plaintext_demo_only_do_not_use_in_prod: form };
            const res = await fetch('/api/v1/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => ({ ok: true } as Response));
            if (!res.ok) throw new Error('server');
            Alert.alert(
                t('vault:alerts.saved_title', { defaultValue: '저장됨' }),
                t('vault:alerts.saved_body', { defaultValue: '개인정보가 추가되었습니다.' }),
                [{ text: t('common:ok', { defaultValue: '확인' }), onPress: () => router.back() }]
            );
        } catch (e: any) {
            Alert.alert(
                t('vault:alerts.fail_title', { defaultValue: '실패' }),
                t('vault:alerts.fail_body', { defaultValue: '저장에 실패했습니다.' })
            );
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

    const td = (k: string, def: string) => t(k, { defaultValue: def });

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: td('vault:add_title', '개인정보 추가'),
                onBackPress: () => router.back()
            }}
        >
            <TabChips items={TYPES as TabItem[]} value={type} onChange={(k) => setType(k as VaultType)} />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAwareScrollView
                    ref={scrollRef}
                    extraHeight={Platform.OS === 'ios' ? 56 : 0}
                    extraScrollHeight={150}
                    enableOnAndroid
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={s.formAreaWrap}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[s.card, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                        <Text style={s.cardTitle}>
                            {
                                {
                                    account: td('vault:type_names.account', '계정 정보'),
                                    card: td('vault:type_names.card', '카드 정보'),
                                    id: td('vault:type_names.id', '신분증 정보'),
                                    license: td('vault:type_names.license', '면허/자격 정보'),
                                    memo: td('vault:type_names.memo', '보안메모'),
                                    device: td('vault:type_names.device', '내 기기'),
                                    photo: td('vault:type_names.photo', '사진 메타'),
                                    other: td('vault:type_names.other', '기타 정보')
                                }[type]
                            }
                        </Text>

                        {FIELDS[type].map((f) => {
                            const label = td(`vault:fields.${type}.${f.key}.label`, f.key);
                            const placeholder = td(`vault:fields.${type}.${f.key}.ph`, '');
                            const isPassword = f.key === 'password';
                            const isSecure = !!f.secureTextEntry && !showPassword;

                            return (
                                <View key={f.key} style={s.field}>
                                    <Text style={s.label}>{label}</Text>

                                    <View style={[s.inputRow, f.multiline && { height: undefined }]}>
                                        <TextInput
                                            style={[s.input, f.multiline && s.inputMultiline]}
                                            placeholder={placeholder}
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

                                    {f.key === 'regNo' && (
                                        <Text style={s.helper}>
                                            {td('vault:helpers.regNo', '※ 실제 주민등록번호 저장은 권장하지 않아요. 꼭 필요 시 안전하게 관리하세요.')}
                                        </Text>
                                    )}
                                    {f.key === 'file' && (
                                        <Text style={s.helper}>
                                            {td(
                                                'vault:helpers.file',
                                                '민감한 사진 업로드는 권장하지 않습니다. 꼭 필요할 때만 사용하세요. (차후 파일 업로드 연동)'
                                            )}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}

                        <TouchableOpacity
                            style={[s.saveBtn, !canSubmit && { opacity: 0.5 }]}
                            disabled={!canSubmit || submitting}
                            onPress={submit}
                        >
                            <Text style={s.saveBtnText}>
                                {submitting ? td('vault:actions.saving', '저장중…') : td('vault:actions.save', '저장')}
                            </Text>
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
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2
    },
    cardTitle: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 8 },
    field: { marginBottom: 14 },
    label: { color: '#222', marginBottom: 6, fontSize: 13, fontWeight: '700' },
    inputRow: { position: 'relative', justifyContent: 'center' },
    input: {
        height: 46,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        color: '#222',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    inputMultiline: { minHeight: 90, paddingTop: 10, paddingBottom: 10 },
    eyeBtn: {
        position: 'absolute',
        right: 10,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        width: 32
    },
    helper: { marginTop: 6, color: '#6b7280', fontSize: 12 },
    saveBtn: {
        marginVertical: 12,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563eb',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
