// app/vault/index.tsx
import { TYPES, VaultType } from '@/src/_constants/vaultTypes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AppLayout from '../_components/AppLayout';
import TabChips, { TabItem } from '../_components/TabChips';

type SortKey = 'recent' | 'created' | 'frequent';
const SORT_STORAGE_KEY = 'vault.sortKey';

interface VaultItem {
    id: string;
    type: VaultType;
    title: string;
    masked: string;
    updatedAt: string;
    createdAt: string;
    usedCount: number;
}

/** i18n 헬퍼: 키 + 기본값 */
const td = (t: any, key: string, def: string) => t(key, { defaultValue: def });

/** ── Sort 옵션을 i18n으로 렌더링 */
function useSortOptions() {
    const { t } = useTranslation('vault.list');
    const OPTS: { key: SortKey; label: string; desc: string }[] = [
        { key: 'recent', label: td(t, 'sort.recent.label', '최근 조회 순'), desc: td(t, 'sort.recent.desc', '최근 본 항목이 위로') },
        { key: 'created', label: td(t, 'sort.created.label', '생성 순'), desc: td(t, 'sort.created.desc', '새로 만든 항목이 위로') },
        { key: 'frequent', label: td(t, 'sort.frequent.label', '자주 사용 순'), desc: td(t, 'sort.frequent.desc', '많이 쓴 항목이 위로') },
    ];
    return OPTS;
}

/** 우측 정렬 피커 */
function SortPicker({
    value,
    onChange,
}: {
    value: SortKey;
    onChange: (k: SortKey) => void;
}) {
    const { t } = useTranslation('vault.list');
    const OPTIONS = useSortOptions();
    const [open, setOpen] = useState(false);
    const selected = OPTIONS.find(o => o.key === value);

    const onSelect = (k: SortKey) => {
        onChange(k);
        setOpen(false);
    };

    return (
        <View style={sp.wrap}>
            <Pressable
                onPress={() => setOpen(true)}
                style={({ pressed }) => [sp.btn, pressed && sp.btnPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${td(t, 'sort.picker_label', '정렬')}: ${selected?.label}`}
            >
                <Text style={sp.btnText} numberOfLines={1}>{selected?.label ?? td(t, 'sort.picker_label', '정렬')}</Text>
                <Ionicons name="chevron-down" size={16} color="#334155" />
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={sp.backdrop} onPress={() => setOpen(false)}>
                    <Pressable style={sp.sheet} onPress={() => { }}>
                        <View style={sp.sheetHeader}>
                            <Text style={sp.sheetTitle}>{td(t, 'sort.sheet_title', '정렬 기준')}</Text>
                        </View>
                        <FlatList
                            data={OPTIONS}
                            keyExtractor={(it) => it.key}
                            renderItem={({ item }) => {
                                const active = item.key === value;
                                return (
                                    <Pressable
                                        onPress={() => onSelect(item.key)}
                                        style={({ pressed }) => [sp.item, pressed && sp.itemPressed]}
                                        accessibilityRole="button"
                                        accessibilityLabel={item.label}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={[sp.itemLabel, active && sp.itemLabelActive]}>{item.label}</Text>
                                            <Text style={sp.itemDesc}>{item.desc}</Text>
                                        </View>
                                        {active && <Ionicons name="checkmark" size={18} color="#2563eb" />}
                                    </Pressable>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={sp.sep} />}
                            contentContainerStyle={{ paddingVertical: 8 }}
                            showsVerticalScrollIndicator={false}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

export default function VaultScreen() {
    const router = useRouter();
    const { t } = useTranslation('vault.list');

    const [activeType, setActiveType] = useState<VaultType>('account');
    const [sortKey, setSortKey] = useState<SortKey>('recent');
    const [items, setItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 저장된 정렬 키 로드
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(SORT_STORAGE_KEY);
                if (saved === 'recent' || saved === 'created' || saved === 'frequent') {
                    setSortKey(saved);
                }
            } catch { }
        })();
    }, []);

    const saveSortKey = useCallback(async (key: SortKey) => {
        setSortKey(key);
        try { await AsyncStorage.setItem(SORT_STORAGE_KEY, key); } catch { }
    }, []);

    const fetchList = useCallback(async (type: VaultType) => {
        setLoading(true);
        try {
            const sampleMasked: Record<VaultType, string> = {
                account: '••••••••',
                card: '****-****-****-1234',
                id: '******-*******',
                license: 'LIC-****-****',
                memo: '보안 메모 ••••',
                device: 'SN: ****-****-ABCD',
                photo: '이미지 ••••',
                other: '••••',
            };
            const now = Date.now();
            const label = TYPES.find(t => t.key === type)?.label ?? '';
            const mock: VaultItem[] = [
                { id: 'v1', type, title: `${label} 예시 1`, masked: sampleMasked[type], updatedAt: new Date(now - 60 * 60 * 1000).toISOString(), createdAt: new Date(now - 10 * 86400000).toISOString(), usedCount: 12 },
                { id: 'v2', type, title: `${label} 예시 2`, masked: sampleMasked[type], updatedAt: new Date(now - 10 * 60 * 1000).toISOString(), createdAt: new Date(now - 3 * 86400000).toISOString(), usedCount: 3 },
                { id: 'v3', type, title: `${label} 예시 3`, masked: sampleMasked[type], updatedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(), createdAt: new Date(now - 30 * 86400000).toISOString(), usedCount: 27 },
            ];
            setItems(mock);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchList(activeType); }, [activeType, fetchList]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchList(activeType);
        setRefreshing(false);
    }, [activeType, fetchList]);

    // 정렬
    const sortedItems = useMemo(() => {
        const copy = [...items];
        switch (sortKey) {
            case 'recent': return copy.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
            case 'created': return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
            case 'frequent': return copy.sort((a, b) => b.usedCount - a.usedCount);
            default: return copy;
        }
    }, [items, sortKey]);

    // 아이콘
    const renderTypeIcon = (type: VaultType) => {
        if (type === 'id') {
            return <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#555" />;
        }
        const map: Record<VaultType, keyof typeof Ionicons.glyphMap> = {
            account: 'person-circle',
            card: 'card',
            id: 'card', // never reached
            license: 'ribbon',
            memo: 'document-text',
            device: 'phone-portrait',
            photo: 'image',
            other: 'cube',
        };
        return <Ionicons name={map[type]} size={20} color="#555" />;
    };

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: td(t, 'title', '개인정보'),
                onBackPress: () => router.back(),
                rightArea: (
                    <TouchableOpacity style={s.addBtn} onPress={() => router.push('/vault/add')}>
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={s.addBtnText}>{td(t, 'add', '추가')}</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <TabChips
                items={TYPES as TabItem[]}
                value={activeType}
                onChange={(k) => setActiveType(k as VaultType)}
            />

            <View style={s.sortRow}>
                <SortPicker value={sortKey} onChange={saveSortKey} />
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={sortedItems}
                    keyExtractor={(it) => it.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={sortedItems.length === 0 ? s.emptyList : { padding: 12 }}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => router.push({ pathname: '/vault/view', params: { id: item.id } })}
                            style={s.card}
                        >
                            <View style={s.iconWrap}>{renderTypeIcon(item.type)}</View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.title} numberOfLines={1}>{item.title}</Text>
                                <Text style={s.masked} numberOfLines={1}>{item.masked}</Text>
                                <Text style={s.meta}>
                                    {td(t, 'meta.updated', '업데이트')}: {new Date(item.updatedAt).toLocaleString()} · {td(t, 'meta.created', '생성')}: {new Date(item.createdAt).toLocaleDateString()} · {td(t, 'meta.used_count', '사용 {{count}}회').replace('{{count}}', String(item.usedCount))}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#999" />
                        </Pressable>
                    )}
                    ListEmptyComponent={<Text style={s.emptyText}>{td(t, 'empty', '해당 종류의 항목이 없습니다.')}</Text>}
                />
            )}
        </AppLayout>
    );
}

/* -------- styles -------- */
const s = StyleSheet.create({
    addBtn: {
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    sortRow: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 2, flexDirection: 'row', justifyContent: 'flex-end' },
    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    title: { color: '#222', fontSize: 16, fontWeight: '700' },
    masked: { color: '#444', marginTop: 2, fontSize: 14 },
    meta: { color: '#666', marginTop: 4, fontSize: 12 },
    emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#666', fontSize: 14 },
});

/* -------- SortPicker styles -------- */
const sp = StyleSheet.create({
    wrap: {},
    btn: {
        minWidth: 120,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#eef2ff',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#c7d2fe',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    btnPressed: { opacity: 0.8 },
    btnText: { fontSize: 12, color: '#1f3fff', fontWeight: '700', maxWidth: 160 },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start', alignItems: 'flex-end' },
    sheet: {
        marginTop: 56,
        marginRight: 12,
        width: 260,
        maxHeight: 320,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    sheetHeader: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eef2f7', backgroundColor: '#f8fafc' },
    sheetTitle: { fontSize: 13, color: '#334155', fontWeight: '700' },
    item: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
    itemPressed: { backgroundColor: '#f8fafc' },
    itemLabel: { fontSize: 14, color: '#111827', fontWeight: '700' },
    itemLabelActive: { color: '#2563eb' },
    itemDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#f1f5f9' },
});
