// app/profile/friends/[id].tsx
import AppLayout from '@/app/_components/AppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// TODO: API 연동 전 임시 데이터 (친구 목록과 동일)
const MOCK_FRIENDS = [
    { id: 'u_01', name: '홍길동', note: '가족', phone: '010-1234-5678' },
    { id: 'u_02', name: '김철수', phone: '010-2222-3333' },
    { id: 'u_03', name: '이영희', note: '직장', phone: '010-9876-5432' }
];

export default function FriendDetailScreen() {
    const { t } = useTranslation('profile_friend');
    const { id } = useLocalSearchParams<{ id: string }>();

    // ID로 친구 데이터 조회
    const friend = useMemo(() => MOCK_FRIENDS.find(f => f.id === id), [id]);

    if (!friend) {
        return (
            <AppLayout
                headerProps={{
                    title: t('title'),
                    onBackPress: () => router.back()
                }}
            >
                <View style={s.wrap}>
                    <Text style={s.empty}>{t('not_found')}</Text>
                </View>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            headerProps={{
                title: t('title'),
                onBackPress: () => router.back(),
                rightArea: (
                    <Pressable
                        onPress={() => console.log('send message')}
                        style={s.headerBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('btn_message')}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                        <Text style={s.headerBtnText}>{t('btn_message')}</Text>
                    </Pressable>
                )
            }}
        >
            <View style={s.wrap}>
                <Ionicons name="person-circle" size={80} color="#555" style={{ alignSelf: 'center' }} />
                <Text style={s.name}>{friend.name}</Text>
                {friend.note && (
                    <Text style={s.note}>
                        {t('label_note')}: {friend.note}
                    </Text>
                )}
                {friend.phone && (
                    <Text style={s.phone}>
                        {t('label_phone')}: {friend.phone}
                    </Text>
                )}
            </View>
        </AppLayout>
    );
}

const s = StyleSheet.create({
    wrap: { flex: 1, padding: 24, alignItems: 'center' },
    name: { fontSize: 20, fontWeight: '700', marginTop: 12, color: '#111' },
    note: { fontSize: 14, color: '#666', marginTop: 6 },
    phone: { fontSize: 14, color: '#333', marginTop: 4 },
    empty: { marginTop: 40, fontSize: 14, color: '#999' },
    headerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0b62ff',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 4,
        marginHorizontal: 8
    },
    headerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' }
});
