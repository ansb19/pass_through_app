// app/help/index.tsx
import AppLayout from '@/app/_components/AppLayout';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabKey = 'tickets' | 'faq' | 'terms';

// 라벨은 i18n에서 렌더링 시점에 가져온다
const TAB_KEYS: TabKey[] = ['tickets', 'faq', 'terms'];

export default function HelpScreen() {
  const { t } = useTranslation('help_index');
  const params = useLocalSearchParams<{ tab?: string }>();
  const initial: TabKey = (params.tab as TabKey) || 'tickets';
  const [tab, setTab] = useState<TabKey>(initial);

  // URL 쿼리로 들어온 탭 반영
  useEffect(() => {
    if (params.tab && ['tickets', 'faq', 'terms'].includes(params.tab)) {
      setTab(params.tab as TabKey);
    }
  }, [params.tab]);

  const Content = useMemo(() => {
    switch (tab) {
      case 'tickets':
        return <TicketsContent />;
      case 'faq':
        return <FAQContent />;
      case 'terms':
        return <TermsContent />;
      default:
        return null;
    }
  }, [tab]);

  const onTabPress = (next: TabKey) => {
    setTab(next);
    router.replace({ pathname: '/help', params: { tab: next } });
  };

  return (
    <AppLayout
      showFooter={false}
      headerProps={{
        title: t('title'),
        onBackPress: () => router.back(),
        rightArea: (
          <TouchableOpacity
            onPress={() => router.push('/help/add')}
            style={s.headerBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('btn_new_ticket')}
          >
            <Text style={s.headerBtnText}>{t('btn_new_ticket')}</Text>
          </TouchableOpacity>
        )
      }}
    >
      {/* 상단 세그먼트 */}
      <View style={s.tabBar}>
        {TAB_KEYS.map(key => {
          const active = tab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[s.tabBtn, active && s.tabBtnActive]}
              onPress={() => onTabPress(key)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t(`tab.${key}`)}
              accessibilityState={{ selected: active }}
            >
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>
                {t(`tab.${key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 본문 */}
      <ScrollView contentContainerStyle={s.body}>
        {Content}
      </ScrollView>
    </AppLayout>
  );
}

/** 문의내역 탭 */
function TicketsContent() {
  const { t } = useTranslation('help_index');
  // 실제 데이터 연동 전, 목업 예시
  const tickets = [
    { id: 'T-20250814-001', title: 'QR 공유가 안돼요', status: '처리중', updatedAt: '2025-08-14 10:21' },
    { id: 'T-20250812-018', title: '지문인증 실패', status: '답변완료', updatedAt: '2025-08-12 17:05' },
  ];

  return (
    <View style={{ gap: 12 }}>
      <View style={s.card}>
        <Text style={s.title}>{t('section_my_tickets')}</Text>
        <View style={{ gap: 10 }}>
          {tickets.map(ti => (
            <TouchableOpacity
              key={ti.id}
              style={s.ticketItem}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/help/ticket/[id]', params: { id: ti.id } })}
              accessibilityRole="button"
              accessibilityLabel={ti.title}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.ticketTitle}>{ti.title}</Text>
                <Text style={s.ticketMeta}>{ti.id} · {ti.updatedAt}</Text>
              </View>
              <View style={s.badge}>
                <Text style={s.badgeText}>{ti.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {tickets.length === 0 && (
            <Text style={s.text}>{t('empty_tickets')}</Text>
          )}
        </View>
      </View>

      {/* 기존 고객센터 섹션 */}
      <SupportFooter />
    </View>
  );
}

/** 기존 '고객센터' 내용 (하단 안내로 사용) */
function SupportFooter() {
  const { t } = useTranslation('help_index');
  return (
    <View style={s.card}>
      <Text style={s.title}>{t('support_title')}</Text>
      <Text style={s.text}>
        {t('support_email_label')}: {t('support_email_value')}
      </Text>
      <Text style={s.text}>
        {t('support_hours_label')}: {t('support_hours_value')}
      </Text>
    </View>
  );
}

function FAQContent() {
  const { t } = useTranslation('help_index');
  return (
    <View style={s.card}>
      <Text style={s.title}>{t('faq_title')}</Text>
      <Text style={s.q}>{t('faq_q1')}</Text>
      <Text style={s.a}>{t('faq_a1')}</Text>

      <Text style={s.q}>{t('faq_q2')}</Text>
      <Text style={s.a}>{t('faq_a2')}</Text>
    </View>
  );
}

function TermsContent() {
  const { t } = useTranslation('help_index');
  return (
    <View style={s.card}>
      <Text style={s.title}>{t('terms_title')}</Text>
      <Text style={s.text}>{t('terms_body')}</Text>
      {/* 길어질 경우 웹뷰/마크다운 뷰어로 교체 추천 */}
    </View>
  );
}

const s = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowOpacity: 0.06,
  },
  tabLabel: { fontSize: 13, color: '#555', fontWeight: '600' },
  tabLabelActive: { color: '#111' },

  body: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 8, elevation: 1, shadowOpacity: 0.04 },
  title: { fontSize: 16, fontWeight: '700' },
  text: { fontSize: 13, color: '#333', lineHeight: 20 },

  q: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  a: { fontSize: 13, color: '#333' },

  ticketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ticketTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  ticketMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },

  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0b62ff',
  },
  headerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
