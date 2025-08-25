import AppLayout from '@/app/_components/AppLayout';
import { requireBiometric } from '@/src/domains/auth/requireBiometric';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ProfileForm, { ProfileFormValues } from '../_components/forms/ProfileForm';

export default function ProfileEditScreen() {
  const { t } = useTranslation(['profile', 'common']);

  // 🔹 세션에서 가져온 현재 사용자 정보 (목업)
  const initialFromSession = {
    nickname: '게스트',
    birthDate: '19970710',
    email: 'guest@example.com',
    phone: '01012345678',
    emailVerified: true,
    phoneVerified: true,
  };

  const [current, setCurrent] = useState<ProfileFormValues>({
    nickname: initialFromSession.nickname,
    birthDate: initialFromSession.birthDate,
    email: initialFromSession.email,
    phone: initialFromSession.phone,
  });
  const [emailVerified, setEmailVerified] = useState(!!initialFromSession.emailVerified);
  const [phoneVerified, setPhoneVerified] = useState(!!initialFromSession.phoneVerified);
  const [busy, setBusy] = useState(false);

  // ✅ dirty 판정: 실제로 바뀐 값이 있는지(읽기전용인 birthDate 제외)
  const dirty = useMemo(() => {
    return (
      current.nickname.trim() !== initialFromSession.nickname.trim() ||
      current.email.trim() !== initialFromSession.email.trim() ||
      current.phone.trim() !== initialFromSession.phone.trim()
    );
  }, [current, initialFromSession]);

  // ==========================
  // 인라인 OTP를 위한 mock API (실서버로 교체)
  // ==========================
  const apiEmailSend = async (email: string) => {
    await new Promise(r => setTimeout(r, 220));
    return { ok: true, ttl: 180 };
  };
  const apiEmailVerify = async (email: string, code: string) => {
    await new Promise(r => setTimeout(r, 220));
    return { ok: code.length === 6 };
  };
  const apiSmsSend = async (phone: string) => {
    await new Promise(r => setTimeout(r, 220));
    return { ok: true, ttl: 180 };
  };
  const apiSmsVerify = async (phone: string, code: string) => {
    await new Promise(r => setTimeout(r, 220));
    return { ok: code.length === 6 };
  };

  // 🔗 ProfileForm으로 넘기는 콜백 (이메일 OTP)
  const onSendEmailOtp = async (email: string) => {
    const res = await apiEmailSend(email);
    if (!res.ok) throw new Error('email send fail');
    return { ttl: res.ttl };
  };
  const onVerifyEmailOtp = async (email: string, code: string) => {
    const res = await apiEmailVerify(email, code);
    if (!res.ok) return false;
    setEmailVerified(true);
    Alert.alert(
      t('profile:email_verified_title', '이메일 인증'),
      t('profile:email_verified_body', '이메일 인증이 완료되었습니다.')
    );
    return true;
  };

  // 🔗 ProfileForm으로 넘기는 콜백 (휴대폰 OTP)
  const onSendPhoneOtp = async (phone: string) => {
    const res = await apiSmsSend(phone);
    if (!res.ok) throw new Error('sms send fail');
    return { ttl: res.ttl };
  };
  const onVerifyPhoneOtp = async (phone: string, code: string) => {
    const res = await apiSmsVerify(phone, code);
    if (!res.ok) return false;
    setPhoneVerified(true);
    Alert.alert(
      t('profile:phone_verified_title', '휴대폰 인증'),
      t('profile:phone_verified_body', '휴대폰 인증이 완료되었습니다.')
    );
    return true;
  };

  // 🔄 이메일/휴대폰 값을 수정하려 할 때 “다시 인증” 모드로 전환
  const onInvalidateEmail = useCallback(() => {
    setEmailVerified(false); // ProfileForm이 인라인 OTP UI를 열 수 있게
  }, []);
  const onInvalidatePhone = useCallback(() => {
    setPhoneVerified(false);
  }, []);

  // 💾 저장
  const onSubmit = useCallback(
    async (values: ProfileFormValues) => {
      if (busy) return;
      if (!dirty) {
        router.back();
        return;
      }

      // 보안: 민감정보 변경 시 생체 인증 재확인
      const changedSensitive =
        values.email.trim() !== initialFromSession.email.trim() ||
        values.phone.trim() !== initialFromSession.phone.trim();

      setBusy(true);
      try {
        if (changedSensitive) {
          const bio = await requireBiometric(t('profile:reauth_prompt'));
          if (!bio.ok) {
            setBusy(false);
            return;
          }
        }

        // TODO: 서버에 PATCH /me 요청
        // await api.updateProfile(values)

        Alert.alert(
          t('common:done', { defaultValue: '완료' }),
          t('profile:saved'),
          [{ text: t('common:ok', { defaultValue: '확인' }), onPress: () => router.back() }]
        );
      } catch (e) {
        Alert.alert(
          t('common:error', { defaultValue: '오류' }),
          t('profile:save_failed')
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, dirty, t]
  );

  return (
    <AppLayout
      showFooter={false}
      headerProps={{
        title: t('profile:edit'),
        onBackPress: () => router.back(),
        rightArea: (
          <Pressable
            onPress={() => onSubmit(current)}
            disabled={busy || !dirty}
            style={({ pressed }) => [s.saveBtn, (pressed || busy || !dirty) && s.saveBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('common:save', { defaultValue: '저장' })}
          >
            <Text style={s.saveBtnText}>{t('common:save', { defaultValue: '저장' })}</Text>
          </Pressable>
        ),
      }}
    >
      <View style={{ padding: 20, paddingBottom: 140, flex: 1 }}>
        <ProfileForm
          mode="edit"
          initial={{
            nickname: initialFromSession.nickname,
            birthDate: initialFromSession.birthDate,
            email: initialFromSession.email,
            phone: initialFromSession.phone,
          }}
          fields={{ nickname: true, birthDate: true, email: true, phone: true }}
          readOnlyFields={{ birthDate: true }}
          showVerifyButtons
          emailVerified={emailVerified}
          phoneVerified={phoneVerified}
          lockVerifiedFields
          autoInvalidateOnEdit={false}  // 사용자가 "변경"을 눌러야 재인증 모드로 전환
          onInvalidateEmail={onInvalidateEmail} // 🔁 다른 화면 이동 없이 인라인 OTP 모드
          onInvalidatePhone={onInvalidatePhone}
          onChange={(values) => setCurrent(values)}
          submitLabel={t('common:save')}
          onSubmit={onSubmit}

          // ✅ 인라인 OTP 연결 (한 화면에서 끝)
          onSendEmailOtp={onSendEmailOtp}
          onVerifyEmailOtp={onVerifyEmailOtp}
          onSendPhoneOtp={onSendPhoneOtp}
          onVerifyPhoneOtp={onVerifyPhoneOtp}
        />
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#0b62ff' },
  saveBtnPressed: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
