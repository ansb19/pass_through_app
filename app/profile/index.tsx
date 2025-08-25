// app/profile/index.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AppLayout from '../_components/AppLayout';

// ✅ PIN 입력 패드
import PasscodePad from '../_components/PasscodePad';
// ✅ 생체 인증
import { requireBiometric } from '@/src/domains/auth/requireBiometric';
// ✅ QR 코드
import QRCode from 'react-native-qrcode-svg';

/* ------------------------------------------------
 * 목업: PIN 검증
 * ----------------------------------------------*/
async function verifyPin(pin: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 200)); // mock latency
  return pin.length === 6; // 데모 로직
}

/* ------------------------------------------------
 * 훅: 강한 재인증 (PIN → 생체)
 * ----------------------------------------------*/
function useStrongReauth() {
  const { t } = useTranslation(['profile_home', 'auth', 'common']);
  const [pinVisible, setPinVisible] = React.useState(false);
  const resolverRef = React.useRef<((pinOrNull: string | null) => void) | null>(null);

  const askPin = React.useCallback((): Promise<string | null> => {
    setPinVisible(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const onPinComplete = React.useCallback((pin: string) => {
    setPinVisible(false);
    resolverRef.current?.(pin);
  }, []);
  const onPinCancel = React.useCallback(() => {
    setPinVisible(false);
    resolverRef.current?.(null);
  }, []);

  const requireStrong = React.useCallback(
    async (bioPrompt: string) => {
      const pin = await askPin();
      if (!pin) return { ok: false, reason: 'pin_cancelled' as const };

      const ok = await verifyPin(pin);
      if (!ok) {
        Alert.alert(t('common:error', { defaultValue: '오류' }), t('auth:pin_invalid', { defaultValue: 'PIN 번호가 올바르지 않습니다.' }));
        return { ok: false, reason: 'pin_invalid' as const };
      }

      const bio = await requireBiometric(bioPrompt);
      if (!bio.ok) {
        Alert.alert(t('common:error', { defaultValue: '오류' }), t('auth:biometric_failed', { defaultValue: '생체 인증에 실패했어요.' }));
        return { ok: false, reason: 'biometric_failed' as const };
      }

      return { ok: true as const };
    },
    [askPin, t]
  );

  const PinModal = React.useMemo(
    () => (
      <Modal transparent visible={pinVisible} animationType="fade" onRequestClose={onPinCancel}>
        <View style={ms.overlay}>
          <View style={ms.modal}>
            <PasscodePad
              title={t('profile_home:pin_modal_title')}
              subtitle={t('profile_home:pin_modal_subtitle')}
              pinLength={6}
              randomize
              fakePress
              onComplete={onPinComplete}
            />
            <Pressable
              onPress={onPinCancel}
              style={ms.cancelLink}
              accessibilityRole="button"
              accessibilityLabel={t('profile_home:pin_modal_cancel')}
            >
              <Text style={ms.cancelText}>{t('profile_home:pin_modal_cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    ),
    [pinVisible, onPinComplete, onPinCancel, t]
  );

  return { requireStrong, PinModal };
}

/* ------------------------------------------------
 * 훅: 탈퇴 닉네임 재확인 모달 (+ 30일 유예 안내)
 *  - 이미 /profile/delete 로 보내는 플로우가 있어서,
 *    이 모달 텍스트만 i18n 연결 (account_delete 네임스페이스 재사용)
 * ----------------------------------------------*/
function useDeleteConfirmModal() {
  const { t } = useTranslation(['account_delete', 'common']);
  const [visible, setVisible] = React.useState(false);
  const [input, setInput] = React.useState('');
  const resolverRef = React.useRef<((ok: boolean) => void) | null>(null);

  const ask = React.useCallback((): Promise<string | null> => {
    setInput('');
    setVisible(true);
    return new Promise((resolve) => {
      resolverRef.current = (ok: boolean) => {
        setVisible(false);
        resolve(ok ? input : null);
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const onCancel = () => resolverRef.current?.(false);
  const onConfirm = () => resolverRef.current?.(true);

  const ModalUI = ({ nickname }: { nickname: string }) => (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={ms.overlay}>
        <View style={ms.modal}>
          <Text style={ms.title}>{t('account_delete:confirm_title')}</Text>
          <Text style={ms.body}>{t('account_delete:confirm_desc')}</Text>
          <Text style={ms.warn}>
            {t('account_delete:warn_text', { days: 30 })}
          </Text>

          <View style={{ marginTop: 14 }}>
            <Text style={ms.label}>{t('account_delete:label_nickname')}</Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('account_delete:ph_nickname', { nickname })}
              autoCapitalize="none"
              autoCorrect={false}
              style={ms.input}
            />
          </View>

          <View style={ms.btnRow}>
            <Pressable onPress={onCancel} style={ms.btnSecondary}>
              <Text>{t('common:cancel', { defaultValue: '취소' })}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={ms.btnDanger}>
              <Text style={ms.btnDangerText}>{t('account_delete:btn_delete')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return { ask, DeleteConfirmModalUI: ModalUI, input, setInput };
}

/* ------------------------------------------------
 * 화면 본체
 * ----------------------------------------------*/
export default function ProfileScreen() {
  const { t } = useTranslation(['profile_home', 'common']);
  const nickname = t('profile_home:guest'); // 데모

  const [busy, setBusy] = React.useState(false);

  const { requireStrong, PinModal } = useStrongReauth();
  const { ask: askDeleteConfirm, DeleteConfirmModalUI } = useDeleteConfirmModal();

  // 편집: 재인증 페이지로
  const onEdit = () => {
    if (busy) return;
    router.push({ pathname: '/auth/reauth', params: { next: '/profile/edit', title: t('profile_home:reauth_edit_title') } });
  };

  // 친구 목록
  const onFriends = () => {
    if (busy) return;
    router.push('/profile/friends');
  };

  // 로그아웃
  const onLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const confirm = await new Promise<boolean>((resolve) => {
        Alert.alert(
          t('profile_home:logout'),
          t('profile_home:logout_confirm'),
          [
            { text: t('common:cancel'), style: 'cancel', onPress: () => resolve(false) },
            { text: t('profile_home:logout'), style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
      if (!confirm) return;

      // await signOut();
      router.replace('/welcome');
    } finally {
      setBusy(false);
    }
  };

  // 탈퇴: 재인증 페이지로
  const onDelete = async () => {
    if (busy) return;
    router.push({ pathname: '/auth/reauth', params: { next: '/profile/delete', title: t('profile_home:reauth_delete_title') } });
  };

  return (
    <AppLayout headerProps={{ title: t('profile_home:title') }}>
      {/* 모달들 (PIN / 탈퇴 확인) */}
      {PinModal}
      <DeleteConfirmModalUI nickname={nickname} />

      <View style={s.wrap}>
        {/* 인사 */}
        <View style={s.card}>
          <Text style={s.hello}>
            <Text style={s.nickname}>{nickname}</Text>
            {t('profile_home:suffix_hello')}
          </Text>
        </View>

        {/* ✅ QR 카드 (액션 리스트 위에 노출) */}
        <View
          style={s.qrCard}
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('profile_home:qr_a11y', { nickname })}
        >
          <Text style={s.qrTitle}>{t('profile_home:qr_title')}</Text>
          <View style={s.qrBox}>
            <QRCode
              value={nickname || 'guest'}
              size={200}
              logoBorderRadius={12}
              backgroundColor="#ffffff"
              color="#111111"
              quietZone={16}
            />
          </View>
          <Text style={s.qrHint}>{t('profile_home:qr_hint')}</Text>
        </View>

        {/* 액션 리스트 */}
        <View style={s.list} accessible accessibilityLabel={t('profile_home:title')}>
          <Row
            icon={<Ionicons name="create-outline" size={22} color="#333" />}
            label={t('profile_home:edit')}
            onPress={onEdit}
            disabled={busy}
          />
          <Row
            icon={<Ionicons name="people-outline" size={22} color="#333" />}
            label={t('profile_home:friends')}
            onPress={onFriends}
            disabled={busy}
          />
          <Row
            icon={<MaterialCommunityIcons name="logout" size={22} color="#333" />}
            label={t('profile_home:logout')}
            onPress={onLogout}
            disabled={busy}
          />
          <Row
            icon={<Ionicons name="trash-outline" size={22} color="#c1121f" />}
            label={t('profile_home:delete')}
            labelStyle={{ color: '#c1121f' }}
            onPress={onDelete}
            disabled={busy}
          />
        </View>
      </View>
    </AppLayout>
  );
}

/* ------------------------------------------------
 * Row & 스타일
 * ----------------------------------------------*/
function Row({
  icon,
  label,
  onPress,
  labelStyle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  labelStyle?: any;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.row, pressed && !disabled && s.pressed, disabled && s.disabled]}
      android_ripple={disabled ? undefined : { color: 'rgba(0,0,0,0.06)' }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={10}
    >
      <View style={s.rowLeft}>
        {icon}
        <Text style={[s.rowText, labelStyle]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 16 },
  card: { backgroundColor: '#f5f8ff', borderRadius: 12, padding: 16 },
  hello: { fontSize: 18, color: '#111' },
  nickname: { fontWeight: '700', color: '#0050b8' },

  // ✅ QR 카드
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  qrTitle: { fontSize: 16, fontWeight: '700', color: '#111', alignSelf: 'flex-start' },
  qrBox: {
    marginTop: 6,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  qrHint: { fontSize: 12, color: '#6b7280', marginTop: 4, alignSelf: 'flex-start' },

  list: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontSize: 15, color: '#222' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
});

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  cancelLink: { marginTop: 12, alignSelf: 'center' },
  cancelText: { color: '#666' },

  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
  body: { fontSize: 13, color: '#333', lineHeight: 20 },
  warn: { fontSize: 13, color: '#ef4444', marginTop: 8 },

  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  btnDanger: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#c1121f',
    alignItems: 'center',
  },
  btnDangerText: { color: '#fff', fontWeight: '700' },
});
