// app/help/ticket/[id].tsx
import AppLayout from '@/app/_components/AppLayout';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🧪 목업 DB (실서비스에서는 API 호출로 교체)
type TicketMessage = {
  id: string;
  role: 'user' | 'agent';
  body: string;
  createdAt: string;
  attachments?: { name: string; url?: string; type?: string; thumb?: string }[];
};
type Ticket = {
  id: string;
  title: string;
  status: '접수' | '처리중' | '답변완료' | '종결';
  category?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  timeline?: { label: string; at: string }[];
};

const TICKET_DB: Ticket[] = [
  {
    id: 'T-20250814-001',
    title: 'QR 공유가 안돼요',
    status: '처리중',
    category: '공유/QR',
    createdAt: '2025-08-14 10:02',
    updatedAt: '2025-08-14 10:21',
    messages: [
      {
        id: 'm1',
        role: 'user',
        body: 'QR을 생성했는데 상대방 앱에서 만료로 떠요. 유효시간 30분으로 했습니다.',
        createdAt: '2025-08-14 10:02',
      },
      {
        id: 'm2',
        role: 'agent',
        body:
          '안녕하세요, pass_through 고객센터입니다.\n' +
          '해당 증상은 기기 시간이 표준시간과 차이가 큰 경우 발생할 수 있습니다. 기기 시간 동기화 후 다시 시도해 보시겠어요?',
        createdAt: '2025-08-14 10:15',
      },
    ],
    timeline: [
      { label: '접수', at: '2025-08-14 10:02' },
      { label: '담당자 배정', at: '2025-08-14 10:12' },
      { label: '처리중', at: '2025-08-14 10:15' },
    ],
  },
  {
    id: 'T-20250812-018',
    title: '지문인증 실패',
    status: '답변완료',
    category: '인증/보안',
    createdAt: '2025-08-12 16:41',
    updatedAt: '2025-08-12 17:05',
    messages: [
      {
        id: 'm1',
        role: 'user',
        body: '지문 인식이 계속 실패합니다. PIN으로는 로그인 됩니다.',
        createdAt: '2025-08-12 16:41',
      },
      {
        id: 'm2',
        role: 'agent',
        body:
          '안녕하세요. 설정 > 보안에서 지문 등록을 재설정해 보세요.\n' +
          '등록된 지문이 OS에 삭제되었거나 변경되면 앱에서 재등록이 필요합니다.',
        createdAt: '2025-08-12 17:02',
      },
      {
        id: 'm3',
        role: 'user',
        body: '재등록 후 정상 동작합니다. 감사합니다.',
        createdAt: '2025-08-12 17:05',
      },
    ],
    timeline: [
      { label: '접수', at: '2025-08-12 16:41' },
      { label: '답변완료', at: '2025-08-12 17:05' },
    ],
  },
];

// ---- i18n 매핑 유틸 ----
type StatusKey = 'received' | 'in_progress' | 'answered' | 'closed';
const statusToKey = (s: Ticket['status']): StatusKey =>
  s === '접수' ? 'received' :
    s === '처리중' ? 'in_progress' :
      s === '답변완료' ? 'answered' : 'closed';

type TimelineKey = 'received' | 'assigned' | 'in_progress' | 'answered' | 'closed';
const timelineToKey = (label: string): TimelineKey | undefined => {
  if (label === '접수') return 'received';
  if (label === '담당자 배정') return 'assigned';
  if (label === '처리중') return 'in_progress';
  if (label === '답변완료') return 'answered';
  if (label === '종결') return 'closed';
  return undefined;
};

// 상태 뱃지 색상(키 기반)
const statusStyle: Record<StatusKey, { bg: string; fg: string }> = {
  received: { bg: '#e5e7eb', fg: '#111827' },
  in_progress: { bg: '#eef2ff', fg: '#3b82f6' },
  answered: { bg: '#ecfdf5', fg: '#059669' },
  closed: { bg: '#f3f4f6', fg: '#6b7280' },
};

export default function TicketDetailScreen() {
  const { t } = useTranslation('help_ticket');
  const { id } = useLocalSearchParams<{ id: string }>();

  const ticket = useMemo(() => TICKET_DB.find(ti => ti.id === id), [id]);

  if (!ticket) {
    return (
      <AppLayout
        showFooter={false}
        headerProps={{
          title: t('title'),
          onBackPress: () => router.back(),
        }}
      >
        <View style={[s.center, { flex: 1 }]}>
          <Text style={s.emptyText}>{t('not_found')}</Text>
        </View>
      </AppLayout>
    );
  }

  const skey = statusToKey(ticket.status);
  const badge = statusStyle[skey];

  return (
    <AppLayout
      showFooter={false}
      headerProps={{
        title: t('title'),
        onBackPress: () => router.back(),
        rightArea: (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/help/add', params: { refId: ticket.id } })}
            style={s.headerBtn}
            activeOpacity={0.8}
          >
            <Text style={s.headerBtnText}>{t('btn_add_followup')}</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <ScrollView contentContainerStyle={s.body}>
        {/* 헤더 */}
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Text style={s.title}>{ticket.title}</Text>
            <View style={[s.badge, { backgroundColor: badge.bg }]}>
              <Text style={[s.badgeText, { color: badge.fg }]}>
                {t(`status.${skey}`)}
              </Text>
            </View>
          </View>
          <Text style={s.meta}>
            {ticket.id} · {t('meta_last_update')} {ticket.updatedAt}
          </Text>
          {!!ticket.category && <Text style={s.category}>{ticket.category}</Text>}
        </View>

        {/* 타임라인 */}
        {ticket.timeline && ticket.timeline.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>{t('section_timeline')}</Text>
            <View style={{ marginTop: 8 }}>
              {ticket.timeline.map((tli, idx) => {
                const tkey = timelineToKey(tli.label);
                return (
                  <View key={`${tli.label}-${idx}`} style={s.timelineItem}>
                    <View style={s.timelineDot} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={s.timelineLabel}>
                        {tkey ? t(`timeline.${tkey}`) : tli.label}
                      </Text>
                      <Text style={s.timelineAt}>{tli.at}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 대화 (문의/답변) */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('section_messages')}</Text>
          <View style={{ marginTop: 8, gap: 12 }}>
            {ticket.messages.map(m => (
              <View
                key={m.id}
                style={[
                  s.msgWrap,
                  m.role === 'user' ? s.msgUser : s.msgAgent,
                ]}
              >
                <View style={s.msgHeader}>
                  <Text style={s.msgRole}>{m.role === 'user' ? t('role.me') : t('role.agent')}</Text>
                  <Text style={s.msgTime}>{m.createdAt}</Text>
                </View>
                <Text style={s.msgBody}>{m.body}</Text>

                {/* 첨부파일 (이미지 썸네일 예시) */}
                {m.attachments && m.attachments.length > 0 && (
                  <View style={s.attachWrap}>
                    {m.attachments.map((a, i) => (
                      <View key={`${m.id}-att-${i}`} style={s.attachItem}>
                        {a.thumb ? (
                          <Image source={{ uri: a.thumb }} style={s.attachThumb} />
                        ) : (
                          <View style={s.attachPlaceholder}>
                            <Text style={s.attachExt}>{a.type || 'FILE'}</Text>
                          </View>
                        )}
                        <Text numberOfLines={1} style={s.attachName}>
                          {a.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 하단 안내 */}
        <View style={[s.card, { marginBottom: 24 }]}>
          <Text style={s.sectionTitle}>{t('section_help_more')}</Text>
          <Text style={s.text}>{t('help_more_desc')}</Text>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  body: { padding: 16, gap: 12 },
  center: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: '#666' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    elevation: 1,
    shadowOpacity: 0.04,
  },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  meta: { fontSize: 12, color: '#666' },
  category: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  text: { fontSize: 13, color: '#333', lineHeight: 20 },

  // 상태 배지
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  // 타임라인
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6 },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#94a3b8',
    marginTop: 6,
  },
  timelineLabel: { fontSize: 13, fontWeight: '700', color: '#111' },
  timelineAt: { fontSize: 12, color: '#6b7280' },

  // 메시지 버블
  msgWrap: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  msgUser: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#f3f4f6' },
  msgAgent: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#e0f2fe' },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgRole: { fontSize: 12, fontWeight: '700', color: '#111' },
  msgTime: { fontSize: 11, color: '#6b7280' },
  msgBody: { fontSize: 13, color: '#111', lineHeight: 20 },

  // 첨부
  attachWrap: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  attachItem: { width: 84 },
  attachThumb: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#eee' },
  attachPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachExt: { fontSize: 11, fontWeight: '700', color: '#3b82f6' },
  attachName: { fontSize: 11, color: '#374151', marginTop: 4 },

  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0b62ff',
  },
  headerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
