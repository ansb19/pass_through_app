
import { useAndroidBackExit } from '@/src/hooks/useAndroidBackExit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../_components/AppLayout';
import LanguageSwitcher from '../_components/LanguageSwitcher';
import NotificationBell from '../_components/NotificationBell';

export default function HomeScreen({ navigation }: any) {
  useAndroidBackExit({ enabled: true });

  // 헤더 타이틀은 common.home, 나머지는 home 네임스페이스 사용
  const { t } = useTranslation(['home', 'common']);

  const unreadCount = 3;
  // 요약 데이터(목업)
  const security = { locked: true, deviceBound: true, backupKey: false };
  const expiringShares = [
    { id: 'tok_1', label: '은행계좌', expiresInSec: 1200 },
    { id: 'tok_2', label: '주민등록증', expiresInSec: 300 }
  ];
  const inbox = [{ id: 'rx_1', from: '홍길동', label: '카드(신한)' }];
  const recent = [{ id: 'it_1', label: '국민은행-개인' }, { id: 'it_2', label: '여권' }];

  return (
    <AppLayout
      showFooter
      headerProps={{
        title: t('home', { ns: 'common' }),
        leftArea: <LanguageSwitcher />,
        rightArea: (

          <NotificationBell
            count={unreadCount}
            size={24}
            onPress={() => router.push('/push')}
            accessibilityLabel={t('check_notifications', { ns: 'common', defaultValue: '알림 확인' })}
            style={{ marginRight: 8 }}
          />

        ),
      }}
    >
      <FlatList
        data={recent}
        keyExtractor={(it) => it.id}
        contentContainerStyle={s.container}
        ListHeaderComponent={
          <>
            <SecurityStatusCard
              security={security}
              onFix={() => router.push('/settings/security')}
            />
            <ExpiringSharesSection
              items={expiringShares}
              onCancel={(id) => { /* TODO: cancel token */ }}
              onSeeAll={() => router.push('/share')}
            />
            <InboxSection
              items={inbox}
              onSeeAll={() => router.push('/share')}
            />
            <SectionTitle
              title={t('recent_history', { ns: 'home' })}
              onMore={() => router.push('/vault')}
            />
          </>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={s.supportEntry}
            onPress={() => router.push('/help')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('support_entry', { ns: 'home' })}
          >
            <Ionicons name="headset-outline" size={20} />
            <Text style={s.supportEntryText}>{t('support_entry', { ns: 'home' })}</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.listItem}
            onPress={() => navigation.push(`/items/${item.id}`)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Ionicons name="document-text-outline" size={20} />
            <Text style={s.listLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </AppLayout>
  );
}

function SectionTitle({ title, onMore }: { title: string; onMore?: () => void }) {
  const { t } = useTranslation('home');
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onMore && (
        <TouchableOpacity onPress={onMore} accessibilityRole="button" accessibilityLabel={t('more')}>
          <Text style={s.more}>{t('more')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SecurityStatusCard({
  security,
  onFix
}: {
  security: { locked: boolean; deviceBound: boolean; backupKey: boolean };
  onFix: () => void;
}) {
  const { t } = useTranslation('home');

  const alerts: string[] = [];
  if (!security.backupKey) alerts.push(t('security.alert_backup_missing'));
  if (!security.deviceBound) alerts.push(t('security.alert_device_unbound'));

  return (
    <View style={s.secCard}>
      <View style={s.secRow}>
        <Ionicons name={security.locked ? 'lock-closed' : 'lock-open'} size={18} />
        <Text style={s.secText}>
          {security.locked ? t('security.locked') : t('security.unlocked')}
        </Text>
      </View>
      {alerts.length > 0 && (
        <TouchableOpacity style={s.secBadge} onPress={onFix} accessibilityRole="button">
          <Text style={s.secBadgeText}>{alerts.join(' · ')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ExpiringSharesSection({
  items,
  onCancel,
  onSeeAll
}: {
  items: { id: string; label: string; expiresInSec: number }[];
  onCancel: (id: string) => void;
  onSeeAll: () => void;
}) {
  const { t } = useTranslation('home');

  return (
    <View>
      <SectionTitle title={t('expiring_title')} onMore={onSeeAll} />
      {items.slice(0, 3).map((x) => (
        <View key={x.id} style={s.shareItem}>
          <MaterialCommunityIcons name="timer-sand" size={18} />
          <Text style={s.shareLabel}>{x.label}</Text>
          <Text style={s.shareTime}>{formatRemain(x.expiresInSec, t)}</Text>
          <TouchableOpacity onPress={() => onCancel(x.id)} accessibilityRole="button">
            <Text style={s.cancel}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function InboxSection({
  items,
  onSeeAll
}: {
  items: { id: string; from: string; label: string }[];
  onSeeAll: () => void;
}) {
  const { t } = useTranslation('home');

  return (
    <View>
      <SectionTitle title={t('inbox_title')} onMore={onSeeAll} />
      {items.slice(0, 3).map((x) => (
        <View key={x.id} style={s.inboxItem}>
          <Ionicons name="download-outline" size={18} />
          <Text style={s.inboxText}>
            {x.from} · {x.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// i18n 단위 약어로 출력
function formatRemain(sec: number, t: (k: string) => string) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}${t('short.min')} ${s}${t('short.sec')}`;
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  more: { fontSize: 12, color: '#0050b8' },

  secCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secText: { fontSize: 14, fontWeight: '600' },
  secBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  secBadgeText: { fontSize: 12, color: '#8a6d3b' },

  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowOpacity: 0.05
  },
  actionLabel: { fontSize: 13, fontWeight: '600' },

  shareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12
  },
  shareLabel: { flex: 1, fontSize: 13 },
  shareTime: { fontSize: 12, color: '#555' },
  cancel: { fontSize: 12, color: '#c00', marginLeft: 8 },

  inboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12
  },
  inboxText: {
    flex: 1,
    fontSize: 13,
    color: '#333'
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  listLabel: { fontSize: 13 },

  supportEntry: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
    shadowOpacity: 0.05
  },
  supportEntryText: { fontSize: 14, fontWeight: '600' }
});
