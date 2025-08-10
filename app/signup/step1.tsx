// app/signup/step1.tsx
import { useRouter } from 'expo-router';

import { useSignupStore } from '@/src/stores/signup_store';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import AppLayout from '../components/AppLayout';
import ProfileForm, { ProfileFormValues } from '../components/forms/ProfileForm';

export default function SignupStepOneScreen() {
    const router = useRouter();
    const setMany = useSignupStore((s) => s.setMany);

    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);


    const handleVerifyEmail = async (email: string) => {
        try {
            // TODO: 백엔드에 /auth/email/send 요청 -> 코드 입력 모달 -> /auth/email/verify
            // 성공 시:
            setEmailVerified(true);
            Alert.alert('이메일 인증', '이메일 인증이 완료되었습니다.');
        } catch (e) {
            Alert.alert('이메일 인증 실패', '다시 시도해 주세요.');
        }
    };

    const handleVerifyPhone = async (phone: string) => {
        try {
            // TODO: /auth/sms/send -> 코드 입력 -> /auth/sms/verify
            setPhoneVerified(true);
            Alert.alert('휴대폰 인증', '휴대폰 인증이 완료되었습니다.');
        } catch (e) {
            Alert.alert('휴대폰 인증 실패', '다시 시도해 주세요.');
        }
    };

    const handleSubmit = (values: ProfileFormValues) => {
        // 필요한 것만 저장 (예: 인증 플래그는 별도 로직에서)
        setMany({
            nickname: values.nickname,
            birthDate: values.birthDate,
            email: values.email,
            emailVerified: true,
            phone: values.phone,
            phoneVerified: true,
        });
        router.push('/signup/step2');
    };

    return (
        <AppLayout showHeader={true} showFooter={false} headerProps={{
            title: '회원가입', showBack: true, onBackPress() {
                router.back();
            },
        }}>
            <View style={{ padding: 20, paddingBottom: 140, flex: 1 }}>
                <ProfileForm
                    mode="signup"
                    showVerifyButtons
                    emailVerified={emailVerified}
                    phoneVerified={phoneVerified}
                    lockVerifiedFields={true}          // 인증 완료면 필드 잠금 + "변경" 링크
                    autoInvalidateOnEdit={false}       // 잠금 모드일 땐 굳이 자동 무효화 불필요
                    onInvalidateEmail={() => setEmailVerified(false)}
                    onInvalidatePhone={() => setPhoneVerified(false)}
                    onVerifyEmail={handleVerifyEmail}
                    onVerifyPhone={handleVerifyPhone}
                    onSubmit={handleSubmit}
                />
            </View>
        </AppLayout>
    );
}
