import AppLayout from '@/app/_components/AppLayout';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ShareTab = 'received' | 'sent';

const TABS: { key: ShareTab; labelKey: string }[] = [
    { key: 'received', labelKey: 'share:tab_received' },
    { key: 'sent', labelKey: 'share:tab_sent' },
];

type BaseShare = {
    id: string;
    title: string;
    masked?: string;
    createdAt: string;
    expiresAt?: string;
};
type ReceivedShare = BaseShare & { fromUser: string; status: 'active' | 'expired' | 'revoked' };
type SentShare = BaseShare & { toUser: string; status: 'active' | 'expired' | 'revoked' };
type ShareItem = ReceivedShare | SentShare;

export default function ShareScreen() {
    const { t } = useTranslation(['share', 'common']);
    const params = useLocalSearchParams<{ tab?: string }>();
    const initial: ShareTab = (params.tab as ShareTab) || 'received';

    const [tab, setTab] = useState<ShareTab>(initial);
    const [refreshing, setRefreshing] = useState(false);

    // 목업 데이터
    const [received, setReceived] = useState<ReceivedShare[]>([
        {
            id: 'rx_20250814_01',
            title: '우리은행 - 공동계정',
            masked: 'woori••34',
            createdAt: '2025-08-14 10:02',
            expiresAt: '2025-08-14 10:32',
            fromUser: '홍길동',
            status: 'active',
        },
        {
            id: 'rx_20250812_18',
            title: '주민등록증',
            masked: '9•••-•••••',
            createdAt: '2025-08-12 17:05',
            expiresAt: '2025-08-12 17:35',
            fromUser: '김영희',
            status: 'expired',
        },
    ]);
    const [sent, setSent] = useState<SentShare[]>([
        {
            id: 'tx_20250814_20',
            title: 'KB카드(결제용)',
            masked: '****-22**',
            createdAt: '2025-08-14 09:41',
            expiresAt: '2025-08-14 10:11',
            toUser: '박준호',
            status: 'active',
        },
        {
            id: 'tx_20250810_07',
            title: '네이버 계정',
            masked: 'naver•••@mail',
            createdAt: '2025-08-10 19:13',
            expiresAt: '2025-08-10 19:43',
            toUser: '이민지',
            status: 'revoked',
        },
    ]);

    useEffect(() => {
        if (params.tab && ['received', 'sent'].includes(params.tab)) {
            setTab(params.tab as ShareTab);
        }
    }, [params.tab]);

    const onTabPress = (next: ShareTab) => {
        setTab(next);
        router.replace({ pathname: '/share', params: { tab: next } });
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    }, []);

    const deleteShare = useCallback(
        (id: string) => {
            Alert.alert(
                t('share:delete_confirm_title'),
                t('share:delete_confirm_desc'),
                [
                    { text: t('common:cancel'), style: 'cancel' },
                    {
                        text: t('common:delete', { defaultValue: '삭제' }),
                        style: 'destructive',
                        onPress: () => {
                            if (tab === 'received') setReceived(prev => prev.filter(x => x.id !== id));
                            else setSent(prev => prev.filter(x => x.id !== id));
                        },
                    },
                ]
            );
        },
        [tab, t]
    );

    const listData = useMemo<ShareItem[]>(() => (tab === 'received' ? received : sent), [tab, received, sent]);

    const HeaderRight = (
        <TouchableOpacity onPress={() => router.push('/vault')} style={s.headerBtn} activeOpacity={0.8}>
            <Text style={s.headerBtnText}>{t('share:add')}</Text>
        </TouchableOpacity>
    );

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: t('share:title'),
                onBackPress: () => router.back(),
                rightArea: HeaderRight,
            }}
        >
            {/* 탭 바 */}
            <View style={s.tabBar}>
                {TABS.map(ti => {
                    const active = tab === ti.key;
                    return (
                        <TouchableOpacity
                            key={ti.key}
                            style={[s.tabBtn, active && s.tabBtnActive]}
                            onPress={() => onTabPress(ti.key)}
                            activeOpacity={0.8}
                        >
                            <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t(ti.labelKey)}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* 리스트 */}
            <FlatList<ShareItem>
                data={listData}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listBody}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={s.emptyWrap}>
                        <Text style={s.emptyTit}>
                            {tab === 'received' ? t('share:empty_received_title') : t('share:empty_sent_title')}
                        </Text>
                        <Text style={s.emptyDesc}>
                            {tab === 'received' ? t('share:empty_received_desc') : t('share:empty_sent_desc')}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <ShareItemCard tab={tab} item={item} onDelete={() => deleteShare(item.id)} />
                )}
            />

            {/* 하단 안내 */}
            <View style={s.footerHelp}>
                <Text style={s.footerHelpText}>{t('share:footer_help')}</Text>
            </View>
        </AppLayout>
    );
}

/** 공유 카드 */
function ShareItemCard({ tab, item, onDelete }: { tab: ShareTab; item: ShareItem; onDelete?: () => void }) {
    const { t } = useTranslation('share');
    const isReceived = tab === 'received';
    const counterpart = isReceived ? (item as ReceivedShare).fromUser : (item as SentShare).toUser;

    const statusMap: Record<'active' | 'expired' | 'revoked', { bg: string; color: string; label: string }> = {
        active: { bg: '#eef9f0', color: '#16a34a', label: t('status_active') },
        expired: { bg: '#f3f4f6', color: '#6b7280', label: t('status_expired') },
        revoked: { bg: '#fff1f2', color: '#e11d48', label: t('status_revoked') },
    };
    const sdata = statusMap[item.status];

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                {!!item.masked && <Text style={styles.masked}>{item.masked}</Text>}
                <Text style={styles.meta}>
                    {isReceived ? t('from_user', { name: counterpart }) : t('to_user', { name: counterpart })}
                </Text>
                <Text style={styles.meta}>
                    {t('created', { time: item.createdAt })}
                    {item.expiresAt ? `  ·  ${t('expires', { time: item.expiresAt })}` : ''}
                </Text>
            </View>

            <View style={styles.rightCol}>
                <View style={[styles.badge, { backgroundColor: sdata.bg }]}>
                    <Text style={[styles.badgeText, { color: sdata.color }]}>{sdata.label}</Text>
                </View>
                <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.8}>
                    <Text style={styles.deleteText}>{t('common:delete', { defaultValue: '삭제' })}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

/* ===== styles (기존 유지) ===== */
const s = StyleSheet.create({
    headerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#0b62ff' },
    headerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    tabBar: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4, marginHorizontal: 16, marginTop: 12, gap: 6 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    tabBtnActive: { backgroundColor: '#fff', elevation: 2, shadowOpacity: 0.06 },
    tabLabel: { fontSize: 13, color: '#555', fontWeight: '600' },
    tabLabelActive: { color: '#111' },
    listBody: { padding: 16, gap: 12 },
    emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyTit: { fontSize: 16, fontWeight: '700', color: '#111' },
    emptyDesc: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
    footerHelp: { paddingHorizontal: 16, paddingBottom: 16 },
    footerHelpText: { fontSize: 12, color: '#6b7280' },
});

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 8, elevation: 1, shadowOpacity: 0.04, flexDirection: 'row' },
    title: { fontSize: 15, fontWeight: '700', color: '#111' },
    masked: { fontSize: 13, color: '#374151' },
    meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    deleteBtn: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fee2e2' },
    deleteText: { color: '#b91c1c', fontSize: 12, fontWeight: '700' },
});
