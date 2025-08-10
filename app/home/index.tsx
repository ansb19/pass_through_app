import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../components/AppLayout';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation(['home', 'common']);

  // 요약 데이터만: 서버에서 counts / expiringOnly / inboxHeads만 가져오도록
  const security = { locked: true, deviceBound: true, backupKey: false };
  const expiringShares = [
    { id: 'tok_1', label: '은행계좌', expiresInSec: 1200 },
    { id: 'tok_2', label: '주민등록증', expiresInSec: 300 },
  ];
  const inbox = [{ id: 'rx_1', from: '홍길동', label: '카드(신한)' }];
  const recent = [{ id: 'it_1', label: '국민은행-개인' }, { id: 'it_2', label: '여권' }];

  const actions = useMemo(() => ([
    { key: 'qr_scan', label: t('qr_scan', { ns: 'home' }), icon: <MaterialCommunityIcons name="qrcode-scan" size={24} />, onPress: () => navigation.push('/qr') },
    { key: 'add', label: t('add_personal', { ns: 'home' }), icon: <Ionicons name="add-circle-outline" size={24} />, onPress: () => navigation.push('/items/new') },
    { key: 'view', label: t('view_personal', { ns: 'home' }), icon: <Ionicons name="document-text-outline" size={24} />, onPress: () => navigation.push('/items') },
    { key: 'share', label: t('share_history', { ns: 'home' }), icon: <MaterialCommunityIcons name="share-outline" size={24} />, onPress: () => navigation.push('/share') },
  ]), [navigation, t]);

  return (
    <AppLayout
      showHeader
      showFooter
      headerProps={{
        title: t('home', { ns: 'common' }),
        // leftArea: <View style={{ width: 40, height: 40, backgroundColor: 'red' }} />,
        rightArea: <LanguageSwitcher />,
        onBackPress: () => router.back(),
        // onSearchPress: () => router.back(),
      }}
      footerProps={{ activeTab: 'home', onTabChange: (tab) => navigation.navigate(tab) }}
    >
      <FlatList
        data={recent}
        keyExtractor={(it) => it.id}

        contentContainerStyle={s.container}
        ListHeaderComponent={
          <>
            <SecurityStatusCard security={security} onFix={() => navigation.push('/settings/security')} />
            <QuickActions actions={actions} />
            <ExpiringSharesSection items={expiringShares} onCancel={(id) => {/* cancel */ }} onSeeAll={() => navigation.push('/share')} />
            <InboxSection items={inbox} onSeeAll={() => navigation.push('/inbox')} />
            <SectionTitle title={t('recent_history', { ns: 'home' })} onMore={() => navigation.push('/recent')} />
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.listItem} onPress={() => navigation.push(`/items/${item.id}`)} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={20} />
            <Text style={s.listLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </AppLayout>
  );
}

function SectionTitle({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onMore && <TouchableOpacity onPress={onMore}><Text style={s.more}>{'더보기 >'}</Text></TouchableOpacity>}
    </View>
  );
}

function SecurityStatusCard({ security, onFix }: { security: { locked: boolean; deviceBound: boolean; backupKey: boolean }; onFix: () => void }) {
  const alerts = [];
  if (!security.backupKey) alerts.push('백업키 미설정');
  if (!security.deviceBound) alerts.push('기기 미등록');

  return (
    <View style={s.secCard}>
      <View style={s.secRow}>
        <Ionicons name={security.locked ? 'lock-closed' : 'lock-open'} size={18} />
        <Text style={s.secText}>{security.locked ? '잠금 상태' : '잠금 해제'}</Text>
      </View>
      {alerts.length > 0 && (
        <TouchableOpacity style={s.secBadge} onPress={onFix}>
          <Text style={s.secBadgeText}>{alerts.join(' · ')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function QuickActions({ actions }: { actions: { key: string; label: string; icon: React.ReactNode; onPress: () => void }[] }) {
  return (
    <View style={s.actionsWrap}>
      {actions.map(a => (
        <TouchableOpacity key={a.key} style={s.actionBtn} onPress={a.onPress} activeOpacity={0.8}>
          {a.icon}
          <Text style={s.actionLabel}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ExpiringSharesSection({ items, onCancel, onSeeAll }: {
  items: { id: string; label: string; expiresInSec: number }[];
  onCancel: (id: string) => void;
  onSeeAll: () => void;
}) {
  return (
    <View>
      <SectionTitle title="만료 임박 공유" onMore={onSeeAll} />
      {items.slice(0, 3).map(x => (
        <View key={x.id} style={s.shareItem}>
          <MaterialCommunityIcons name="timer-sand" size={18} />
          <Text style={s.shareLabel}>{x.label}</Text>
          <Text style={s.shareTime}>{formatRemain(x.expiresInSec)}</Text>
          <TouchableOpacity onPress={() => onCancel(x.id)}><Text style={s.cancel}>취소</Text></TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function InboxSection({ items, onSeeAll }: { items: { id: string; from: string; label: string }[]; onSeeAll: () => void }) {
  return (
    <View>
      <SectionTitle title="받은 공유" onMore={onSeeAll} />
      {items.slice(0, 3).map(x => (
        <View key={x.id} style={s.inboxItem}>
          <Ionicons name="download-outline" size={18} />
          <Text style={s.inboxText}>{x.from} · {x.label}</Text>
        </View>
      ))}
    </View>
  );
}

function formatRemain(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s}s`;
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  more: { fontSize: 12, color: '#0050b8' },

  secCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secText: { fontSize: 14, fontWeight: '600' },
  secBadge: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#fff3cd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  secBadgeText: { fontSize: 12, color: '#8a6d3b' },

  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  actionBtn: { width: '48%', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, alignItems: 'center', gap: 6, elevation: 2, shadowOpacity: 0.05 },
  actionLabel: { fontSize: 13, fontWeight: '600' },

  shareItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  shareLabel: { flex: 1, fontSize: 13 },
  shareTime: { fontSize: 12, color: '#555' },
  cancel: { fontSize: 12, color: '#c00', marginLeft: 8 },

  inboxItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  inboxText: {
    flex: 1,                 // 남은 공간 차지
    fontSize: 13,
    color: '#333',
  },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  listLabel: { fontSize: 13 }
});
