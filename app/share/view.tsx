// app/share/view.tsx
import AppLayout from '@/app/_components/AppLayout';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// import { requireBiometric } from '@/src/auth/requireBiometric'; // 프로젝트에 있으면 주석 해제

type ShareStatus = 'active' | 'expired' | 'revoked' | 'invalid';

type SharePayload = {
    id: string;
    title: string;       // 예: "우리은행 - 공동계정"
    masked?: string;     // 가려진 표시
    secret?: string;     // 전체 비밀 (인증 전에는 내려오지 않거나 마스킹)
    fromUser: string;    // 보낸 사람
    createdAt: string;
    expiresAt: string;   // ISO or "YYYY-MM-DD HH:mm"
    status: ShareStatus;
};

// ======= 목업 API 시뮬레이터 =======
async function fetchShareByToken(token: string): Promise<SharePayload> {
    // 실제로는: GET /api/shares/view?token=...
    // 서버는 토큰 유효성/만료/회수여부를 판단해 status와 메타를 내려줌 (비밀값은 기본 마스킹)
    await new Promise(r => setTimeout(r, 600));
    if (!token.startsWith('tok_')) {
        return Promise.resolve({
            id: 'invalid',
            title: '유효하지 않은 공유',
            fromUser: '알 수 없음',
            createdAt: '',
            expiresAt: '',
            status: 'invalid',
        } as SharePayload);
    }

    // 30분 만료 가정: 지금 기준 + 25분 남음
    const now = new Date();
    const expires = new Date(now.getTime() + 25 * 60 * 1000);

    return {
        id: 'rx_20250814_01',
        title: '우리은행 - 공동계정',
        masked: 'woori••34',
        // secret은 인증 이후 별도 엔드포인트에서 받는 걸 권장.
        // 여기선 데모로 기본은 제공 안 함.
        secret: undefined,
        fromUser: '홍길동',
        createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
            `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        expiresAt: `${expires.getFullYear()}-${String(expires.getMonth() + 1).padStart(2, '0')}-${String(expires.getDate()).padStart(2, '0')} ` +
            `${String(expires.getHours()).padStart(2, '0')}:${String(expires.getMinutes()).padStart(2, '0')}`,
        status: 'active',
    };
}

async function fetchSecretAfterStrongAuth(id: string): Promise<string> {
    // 실제로는: POST /api/shares/reveal  (바이오+PIN 통과 토큰과 함께)
    await new Promise(r => setTimeout(r, 500));
    return 'woori-1234-5678-90'; // 데모 시크릿
}

function parseToDate(s: string) {
    // "YYYY-MM-DD HH:mm" 혹은 ISO 대응
    const d = new Date(s.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
}

export default function ShareViewScreen() {
    const { token } = useLocalSearchParams<{ token?: string }>();
    const [loading, setLoading] = useState(true);
    const [payload, setPayload] = useState<SharePayload | null>(null);
    const [revealing, setRevealing] = useState(false);
    const [secret, setSecret] = useState<string | undefined>(undefined);
    const [now, setNow] = useState<Date>(new Date());
    const timerRef = useRef<number | null>(null);

    const expiresAt = useMemo(() => parseToDate(payload?.expiresAt ?? ''), [payload?.expiresAt]);
    const remainingStr = useMemo(() => {
        if (!expiresAt) return '';
        const diff = expiresAt.getTime() - now.getTime();
        if (diff <= 0) return '만료됨';
        const mm = Math.floor(diff / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        return `${mm}분 ${String(ss).padStart(2, '0')}초 남음`;
    }, [expiresAt, now]);

    const isInactive = payload?.status !== 'active' || (expiresAt && expiresAt.getTime() <= now.getTime());

    // 최초 로드
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!token) throw new Error('토큰 없음');
                const res = await fetchShareByToken(token);
                if (!mounted) return;
                setPayload(res);
            } catch (e) {
                Alert.alert('오류', '공유 정보를 불러올 수 없습니다.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [token]);

    // 1초 카운트다운
    useEffect(() => {
        timerRef.current && clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setNow(new Date()), 1000);
        return () => {
            timerRef.current && clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, []);

    // 만료/회수되면 안내
    useEffect(() => {
        if (!payload) return;
        if (payload.status === 'invalid') {
            Alert.alert('유효하지 않은 링크', '공유 토큰이 잘못되었어요.', [
                { text: '닫기', onPress: () => router.back() },
            ]);
            return;
        }
        if (payload.status === 'revoked') {
            Alert.alert('회수됨', '보낸 사람이 공유를 회수했어요.', [
                { text: '닫기', onPress: () => router.back() },
            ]);
            return;
        }
    }, [payload]);

    const revealSecret = useCallback(async () => {
        if (!payload) return;

        if (isInactive) {
            Alert.alert('만료', '공유가 만료되었거나 사용할 수 없어요.');
            return;
        }

        try {
            setRevealing(true);

            // 1) 기기 생체+PIN 강제 (프로젝트 유틸 있으면 사용)
            // const ok = await requireBiometric({ needPin: true });
            // if (!ok) { setRevealing(false); return; }

            // 데모: 확인 다이얼로그
            const ok = await new Promise<boolean>(resolve => {
                Alert.alert(
                    '강화 인증',
                    '지문 + PIN 인증 후 전체 비밀을 확인합니다.',
                    [
                        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
                        { text: '확인', onPress: () => resolve(true) },
                    ]
                );
            });
            if (!ok) { setRevealing(false); return; }

            // 2) 서버에 “인증성공 토큰”과 함께 전체 비밀 요청
            const full = await fetchSecretAfterStrongAuth(payload.id);
            setSecret(full);
            Alert.alert('주의', '비밀은 주변에 노출되지 않도록 주의하세요.');
        } catch (e) {
            Alert.alert('오류', '비밀을 불러오지 못했어요. 다시 시도해 주세요.');
        } finally {
            setRevealing(false);
        }
    }, [payload, isInactive]);

    const revokeAndClose = useCallback(() => {
        // 받는 측 화면에서는 보통 회수 권한 없음. 보낸 사람 화면이라면 회수 요청.
        // 여기서는 단순 닫기.
        router.back();
    }, []);

    const Content = () => {
        if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator />
                    <Text style={styles.dimText}>불러오는 중…</Text>
                </View>
            );
        }

        if (!payload) {
            return (
                <View style={styles.center}>
                    <Text style={styles.warnText}>공유 정보를 찾을 수 없어요.</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
                        <Text style={styles.primaryBtnText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const pill = (() => {
            const m: Record<ShareStatus, { bg: string; color: string; label: string }> = {
                active: { bg: '#e8f1ff', color: '#2563eb', label: '진행중' },
                expired: { bg: '#f3f4f6', color: '#6b7280', label: '만료' },
                revoked: { bg: '#fff1f2', color: '#e11d48', label: '회수됨' },
                invalid: { bg: '#fefce8', color: '#ca8a04', label: '유효하지 않음' },
            };
            const p = isInactive
                ? (payload.status === 'active' ? m.expired : m[payload.status])
                : m.active;
            return (
                <View style={[styles.badge, { backgroundColor: p.bg }]}>
                    <Text style={[styles.badgeText, { color: p.color }]}>{p.label}</Text>
                </View>
            );
        })();

        return (
            <View style={styles.body}>
                {/* 헤더 블록 */}
                <View style={styles.headerCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{payload.title}</Text>
                        <Text style={styles.meta}>보낸사람: {payload.fromUser}</Text>
                        <Text style={styles.meta}>생성: {payload.createdAt}</Text>
                        {!!payload.expiresAt && (
                            <Text style={styles.meta}>
                                만료: {payload.expiresAt}  {isInactive ? '· 만료됨' : `· ${remainingStr}`}
                            </Text>
                        )}
                    </View>
                    {pill}
                </View>

                {/* 비밀 영역 */}
                <View style={styles.secretCard}>
                    <Text style={styles.secretLabel}>비밀 정보</Text>

                    {secret ? (
                        <View style={styles.secretBox}>
                            <Text style={styles.secretText}>{secret}</Text>
                        </View>
                    ) : (
                        <View style={styles.secretBoxMasked}>
                            <Text style={styles.maskedText}>
                                {payload.masked ?? '••••••••'}
                            </Text>
                            <Text style={styles.helper}>
                                전체 비밀은 기기 지문 + PIN 인증 후 확인할 수 있어요.
                            </Text>
                        </View>
                    )}

                    <View style={styles.row}>
                        {!secret && (
                            <TouchableOpacity
                                style={[styles.primaryBtn, isInactive && { opacity: 0.5 }]}
                                onPress={revealSecret}
                                disabled={isInactive || revealing}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.primaryBtnText}>
                                    {revealing ? '확인 중…' : '지문+PIN으로 전체 보기'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => router.back()}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.secondaryBtnText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 주의 문구 */}
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>
                        공유는 기본 30분 후 만료됩니다. 비밀은 스크린샷/화면녹화에 노출될 수 있으니 주변을 확인하세요.
                    </Text>
                </View>

                {/* (선택) 보관함 이동/회수 등 추가 액션이 필요하면 아래에 배치 */}
                {/* <Pressable style={styles.linkBtn} onPress={revokeAndClose}>
          <Text style={styles.linkBtnText}>공유 닫기</Text>
        </Pressable> */}
            </View>
        );
    };

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: '공유 보기',
                onBackPress: () => router.back(),
            }}
        >
            <Content />
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
    dimText: { color: '#6b7280' },
    warnText: { color: '#b91c1c', fontWeight: '700' },

    body: { flex: 1, padding: 16, gap: 14 },

    headerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        gap: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#eee',
        alignItems: 'flex-start',
    },
    title: { fontSize: 16, fontWeight: '800', color: '#111' },
    meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },

    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: '700' },

    secretCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#eee',
        gap: 12,
    },
    secretLabel: { fontSize: 13, color: '#374151', fontWeight: '700' },
    secretBox: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dbeafe',
        backgroundColor: '#eff6ff',
        padding: 14,
    },
    secretText: { fontSize: 16, color: '#111', fontWeight: '700' },
    secretBoxMasked: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        padding: 14,
    },
    maskedText: { fontSize: 16, color: '#111', fontWeight: '800', letterSpacing: 1 },
    helper: { marginTop: 6, fontSize: 12, color: '#6b7280' },

    row: { flexDirection: 'row', gap: 8, marginTop: 4 },
    primaryBtn: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#0b62ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontWeight: '800' },
    secondaryBtn: {
        height: 46,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: { color: '#111', fontWeight: '800' },

    notice: { paddingHorizontal: 2, paddingVertical: 4 },
    noticeText: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

    linkBtn: { paddingVertical: 10, alignItems: 'center' },
    linkBtnText: { color: '#2563eb', fontWeight: '700' },
});
