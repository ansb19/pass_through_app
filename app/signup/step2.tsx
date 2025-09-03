import { AuthApi } from '@/src/domains/auth/api/auth.api';
import { UserService } from '@/src/domains/user/services/user.service';
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

  // ===== ProfileForm에 넘길 콜백들 =====

  const onCheckNickname = async (nickname: string) => {
    const dup = await UserService.checkDuplicate('nickname', nickname);
    if (dup.isDuplicate) {
      Alert.alert(
        t('signup:nickname_duplicate_title', '닉네임 중복'),
        t('signup:nickname_duplicate_body', '이미 사용 중인 닉네임입니다.')
      );
      return false;
    }
    return true;
  };

  const onSendEmailOtp = async (email: string) => {
    const dup = await UserService.checkDuplicate('email', email);
    if (dup.isDuplicate) {
      Alert.alert(
        t('signup:email_duplicate_title', '이메일 중복'),
        t('signup:email_duplicate_body', '이미 사용 중인 이메일입니다.')
      );
      return null;
    }

    try {
      const res = await AuthApi.sendCode('email', email);
      if (!res.success) throw new Error('email send fail');
      return { ttl: res.ttl ?? 300 };
    } catch {
      Alert.alert('오류', '이메일 인증 코드를 보내지 못했습니다.');
      return null;
    }
  };

  const onVerifyEmailOtp = async (email: string, code: string) => {
    try {
      const res = await AuthApi.verifyCode('email', email, code);
      if (!res.success) throw new Error();
      setEmailVerified(true);
      Alert.alert(
        t('signup:email_verify_success_title', '이메일 인증'),
        t('signup:email_verify_success_body', '이메일 인증이 완료되었습니다.')
      );
      return true;
    } catch {
      Alert.alert(
        t('signup:email_verify_fail_title', '이메일 인증 실패'),
        t('signup:email_verify_fail_body', '시간이 지났거나 잘못된 코드입니다. 다시 시도해주세요.')
      );
      return false;
    }
  };

  const onSendPhoneOtp = async (phone: string) => {
    const dup = await UserService.checkDuplicate('phone', phone);
    if (dup.isDuplicate) {
      Alert.alert(
        t('signup:phone_duplicate_title', '휴대폰 중복'),
        t('signup:phone_duplicate_body', '이미 사용 중인 휴대폰 번호입니다.')
      );
      return null;
    }

    try {
      const res = await AuthApi.sendCode('sms', phone);
      if (!res.success) throw new Error('sms send fail');
      return { ttl: res.ttl ?? 300 };
    } catch {
      Alert.alert('오류', 'SMS 인증 코드를 보내지 못했습니다.');
      return null;
    }
  };

  const onVerifyPhoneOtp = async (phone: string, code: string) => {
    try {
      const res = await AuthApi.verifyCode('sms', phone, code);
      if (!res.success) throw new Error();
      setPhoneVerified(true);
      Alert.alert(
        t('signup:phone_verify_success_title', '휴대폰 인증'),
        t('signup:phone_verify_success_body', '휴대폰 인증이 완료되었습니다.')
      );
      return true;
    } catch {
      Alert.alert(
        t('signup:phone_verify_fail_title', '휴대폰 인증 실패'),
        t('signup:phone_verify_fail_body', '시간이 지났거나 잘못된 코드입니다. 다시 시도해주세요.')
      );
      return false;
    }
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
      phoneVerified: true,
    });
    router.push('/signup/step3');
  };

  return (
    <AppLayout
      showFooter={false}
      headerProps={{
        title: t('signup:title', '회원가입'),
        onBackPress() {
          router.back();
        },
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
          onSendEmailOtp={onSendEmailOtp}
          onVerifyEmailOtp={onVerifyEmailOtp}
          onSendPhoneOtp={onSendPhoneOtp}
          onVerifyPhoneOtp={onVerifyPhoneOtp}
          onSubmit={handleSubmit}
          onCheckNickname={onCheckNickname}
        />
      </View>
    </AppLayout>
  );
}
