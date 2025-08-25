// app/profile/friends.tsx
import AppLayout from '@/app/_components/AppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type Friend = { id: string; name: string; note?: string };

// TODO: API 연동 전 임시 데이터
const MOCK_FRIENDS: Friend[] = [
    { id: 'u_01', name: '홍길동', note: '가족' },
    { id: 'u_02', name: '김철수' },
    { id: 'u_03', name: '이영희', note: '직장' }
];

export default function FriendsScreen() {
    const { t } = useTranslation('friends_list');
    const data = useMemo(() => MOCK_FRIENDS, []);

    const onAdd = () => {
        router.push('/profile/friends/add');
    };

    const openDetail = (id: string) => {
        router.push({ pathname: '/profile/friends/[id]', params: { id } });
    };

    return (
        <AppLayout
            headerProps={{
                title: t('title'),
                onBackPress: () => router.back(),
                rightArea: (
                    <Pressable
                        onPress={onAdd}
                        style={s.headerBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('a11y_add')}
                    >
                        <Text style={s.headerBtnText}>{t('btn_add')}</Text>
                    </Pressable>
                )
            }}
        >
            <View style={s.wrap}>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => openDetail(item.id)}
                            style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
                            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                            accessibilityRole="button"
                            accessibilityLabel={t('a11y_detail', { name: item.name })}
                            hitSlop={10}
                        >
                            <View style={s.rowLeft}>
                                <Ionicons name="person-circle-outline" size={28} color="#555" />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.name}>{item.name}</Text>
                                    {item.note ? <Text style={s.note}>{item.note}</Text> : null}
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#aaa" />
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Text style={s.emptyText}>{t('empty')}</Text>
                        </View>
                    }
                    contentContainerStyle={{ padding: 16 }}
                />
            </View>
        </AppLayout>
    );
}

const s = StyleSheet.create({
    wrap: { flex: 1 },
    row: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#eee'
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    name: { fontSize: 15, color: '#111', fontWeight: '700' },
    note: { fontSize: 12, color: '#666', marginTop: 2 },
    empty: { padding: 24, alignItems: 'center' },
    emptyText: { color: '#666', fontSize: 13 },
    headerBtn: {
        marginHorizontal: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#0b62ff'
    },
    headerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' }
});
