import { useSignupStore } from '@/src/stores/signup_store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import AppLayout from '../_components/AppLayout';
import ProfileForm, { ProfileFormValues } from '../_components/forms/ProfileForm';

export default function SignupStepTwoScreen() {
  const router = useRouter();
  const setMany = useSignupStore((s) => s.setMany);
  const { t } = useTranslation(['signup']);

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // ===== Mock API: 실제 API로 교체 =====
  const apiEmailSend = async (email: string) => {
    await new Promise(r => setTimeout(r, 250));
    return { ok: true, txId: 'email_tx', ttl: 180 };
  };
  const apiEmailVerify = async (email: string, code: string) => {
    await new Promise(r => setTimeout(r, 250));
    return { ok: code.length === 6 };
  };
  const apiSmsSend = async (phone: string) => {
    await new Promise(r => setTimeout(r, 250));
    return { ok: true, txId: 'sms_tx', ttl: 180 };
  };
  const apiSmsVerify = async (phone: string, code: string) => {
    await new Promise(r => setTimeout(r, 250));
    return { ok: code.length === 6 };
  };

  // ===== ProfileForm에 넘길 콜백들 =====
  const onSendEmailOtp = async (email: string) => {
    const res = await apiEmailSend(email);
    if (!res.ok) throw new Error('email send fail');
    return { ttl: res.ttl }; // 남은 초
  };

  const onVerifyEmailOtp = async (email: string, code: string) => {
    const res = await apiEmailVerify(email, code);
    if (!res.ok) return false;
    setEmailVerified(true);
    Alert.alert(
      t('signup:email_verify_success_title', '이메일 인증'),
      t('signup:email_verify_success_body', '이메일 인증이 완료되었습니다.')
    );
    return true;
  };

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
      t('signup:phone_verify_success_title', '휴대폰 인증'),
      t('signup:phone_verify_success_body', '휴대폰 인증이 완료되었습니다.')
    );
    return true;
  };

  const handleSubmit = (values: ProfileFormValues) => {
    if (!emailVerified || !phoneVerified) {
      Alert.alert(
        t('signup:verify_required_title', '인증 필요'),
        t('signup:verify_required_body', '이메일과 휴대폰 인증을 완료해주세요.')
      );
      return;
    }
    setMany({
      nickname: values.nickname,
      birthDate: values.birthDate,
      email: values.email,
      emailVerified: true,
      phone: values.phone,
      phoneVerified: true
    });
    router.push('/signup/step3');
  };

  return (
    <AppLayout
      showFooter={false}
      headerProps={{
        title: t('signup:title', '회원가입'),
        onBackPress() { router.back(); }
      }}
    >
      <View style={{ padding: 20, paddingBottom: 140, flex: 1 }}>
        <ProfileForm
          mode="signup"
          showVerifyButtons
          emailVerified={emailVerified}
          phoneVerified={phoneVerified}
          lockVerifiedFields
          autoInvalidateOnEdit={false}
          onInvalidateEmail={() => setEmailVerified(false)}
          onInvalidatePhone={() => setPhoneVerified(false)}
          // === 여기 4개만 연결하면 인라인 OTP 동작 ===
          onSendEmailOtp={onSendEmailOtp}
          onVerifyEmailOtp={onVerifyEmailOtp}
          onSendPhoneOtp={onSendPhoneOtp}
          onVerifyPhoneOtp={onVerifyPhoneOtp}
          onSubmit={handleSubmit}
        />
      </View>
    </AppLayout>
  );
}
