// app/vault/view.tsx
import { VaultType } from '@/src/_constants/vaultTypes';
import { requireBiometric } from '@/src/domains/auth/requireBiometric';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppLayout from '../_components/AppLayout';

// 아이콘 렌더
const renderTypeIcon = (type: VaultType, size = 22, color = '#555') => {
    if (type === 'id') {
        return <MaterialCommunityIcons name="card-account-details-outline" size={size} color={color} />;
    }
    const map: Record<VaultType, keyof typeof Ionicons.glyphMap> = {
        account: 'person-circle',
        card: 'card',
        id: 'card', // never used (위에서 가림)
        license: 'ribbon',
        memo: 'document-text',
        device: 'phone-portrait',
        photo: 'image',
        other: 'cube',
    };
    return <Ionicons name={map[type]} size={size} color={color} />;
};

interface VaultField {
    label: string;
    value: string;
    sensitive?: boolean; // 👈 민감값 표시
}

interface VaultDetail {
    id: string;
    type: VaultType;
    title: string;
    fields: VaultField[];
    updatedAt: string;
}

export default function VaultViewScreen() {
    const router = useRouter();
    const { t } = useTranslation('vault.view');
    const { id } = useLocalSearchParams<{ id: string }>();

    const [detail, setDetail] = useState<VaultDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [reveal, setReveal] = useState(false); // 👈 민감값 보기 여부

    // 샘플 Fetch (실서버 연동 전)
    useEffect(() => {
        setLoading(true);
        // TODO: /vault/:id 호출
        const timer = setTimeout(() => {
            setDetail({
                id: id ?? '',
                type: 'account',
                title: '우리은행 인터넷뱅킹',
                fields: [
                    { label: t('field.site', { defaultValue: '사이트/앱' }), value: 'https://wooribank.com' },
                    { label: t('field.username', { defaultValue: '아이디' }), value: 'user@example.com' },
                    { label: t('field.password', { defaultValue: '비밀번호' }), value: 'myS3cretP@ss', sensitive: true },
                    { label: t('field.note', { defaultValue: '메모' }), value: 'OTP 필요, 2차 인증 적용' },
                ],
                updatedAt: new Date().toISOString(),
            });
            setLoading(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [id, t]);

    const sensitiveExists = useMemo(() => !!detail?.fields.some(f => f.sensitive), [detail]);

    async function onToggleReveal() {
        if (reveal) {
            setReveal(false);
            return;
        }
        // 보기 전에 생체 인증
        const bio = await requireBiometric(t('auth_prompt', { defaultValue: '본인 확인을 위해 생체 인증을 진행해 주세요.' }));
        if (!bio.ok) return;
        setReveal(true);
    }

    async function copy(val: string) {
        try {
            await Clipboard.setStringAsync(val);
            Alert.alert(t('copied_title', { defaultValue: '복사됨' }), t('copied_desc', { defaultValue: '클립보드에 복사되었습니다.' }));
        } catch {
            Alert.alert(t('copy_fail', { defaultValue: '복사에 실패했습니다.' }));
        }
    }

    if (loading || !detail) {
        return (
            <AppLayout
                showFooter={false}
                headerProps={{ title: t('title', { defaultValue: '개인정보 보기' }), onBackPress: () => router.back() }}
            >
                <View style={s.loading}><ActivityIndicator color="#2563eb" /></View>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: t('title', { defaultValue: '개인정보 보기' }),
                onBackPress: () => router.back(),
                rightArea: (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* 공유하기 (TODO: 실제 공유 플로우로 이동) */}
                        <Pressable onPress={() => router.push({ pathname: '/share', params: { tab: 'sent' } })} style={{ marginRight: 16 }}>
                            <Ionicons name="share-outline" size={20} color="#2563eb" />
                        </Pressable>
                        {/* 편집 (TODO: 편집 화면 경로) */}

                        <Pressable onPress={() => router.push({ pathname: '/vault/edit', params: { id: detail.id } })} style={{ marginRight: 8 }}>
                            <Ionicons name="create-outline" size={20} color="#2563eb" />
                        </Pressable>
                    </View>
                ),
            }}
        >
            <ScrollView contentContainerStyle={s.container}>
                <View style={s.card}>
                    <View style={s.headerRow}>
                        <View style={s.iconWrap}>{renderTypeIcon(detail.type, 24, '#2563eb')}</View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.title}>{detail.title}</Text>
                            <Text style={s.meta}>
                                {t('updated', { defaultValue: '업데이트' })}: {new Date(detail.updatedAt).toLocaleString()}
                            </Text>
                        </View>

                        {sensitiveExists && (
                            <Pressable onPress={onToggleReveal} style={s.revealBtn} accessibilityRole="button">
                                <Ionicons name={reveal ? 'eye-off' : 'eye'} size={18} color="#2563eb" />
                                <Text style={s.revealText}>
                                    {reveal ? t('hide', { defaultValue: '가리기' }) : t('reveal', { defaultValue: '보기' })}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    <View style={s.divider} />

                    {detail.fields.map((f, idx) => {
                        const masked = f.sensitive && !reveal;
                        const display = masked ? '••••••••' : f.value;

                        return (
                            <View key={`${f.label}-${idx}`} style={s.fieldRow}>
                                <Text style={s.fieldLabel}>{f.label}</Text>
                                <View style={s.valueRow}>
                                    <Text style={[s.fieldValue, masked && { letterSpacing: 2 }]} numberOfLines={2}>
                                        {display}
                                    </Text>
                                    {!!f.value && (
                                        <Pressable onPress={() => copy(f.value)} hitSlop={8} style={s.copyBtn} accessibilityRole="button">
                                            <Ionicons name="copy-outline" size={16} color="#6b7280" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </AppLayout>
    );
}

const s = StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    container: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    title: { fontSize: 16, fontWeight: '700', color: '#111' },
    meta: { fontSize: 12, color: '#666', marginTop: 2 },
    revealBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#eef2ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    revealText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb', marginVertical: 12 },
    fieldRow: { marginBottom: 12 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 },
    valueRow: { flexDirection: 'row', alignItems: 'center' },
    fieldValue: { fontSize: 14, color: '#111', flex: 1 },
    copyBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
