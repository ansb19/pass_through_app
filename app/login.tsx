import { requireBiometric } from '@/src/domains/auth/requireBiometric';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import AppLayout from './_components/AppLayout';
import PasscodePad from './_components/PasscodePad';


export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const handleComplete = async (pin: string) => {
    // ⚠️ PIN은 화면/로그에 노출하지 말 것
    // TODO: 여기서 PIN 검증 or 파생키 생성(KDF) 등 처리

    // 2) 생체 인증
    const bio = await requireBiometric(t('biometric_prompt'));
    if (!bio.ok) {
      // 필요시: bio.reason에 따라 토스트/폴백 처리
      if (bio.fallbackToPin) {
        // 예: “생체 인증 불가/실패 → PIN만으로 계속 진행” or 재시도
      }
      return;
    }

    // 성공 → 홈으로 전환(뒤로가기로 로그인 못 돌아오게 replace 권장)
    router.replace('/home');

    // try {
    //   await Notifications.scheduleNotificationAsync({
    //     content: {
    //       title: '로그인 완료',
    //       body: '보안 확인이 끝났어요.',
    //     },
    //     trigger: null, // 즉시
    //   });
    // } catch (e) {
    //   console.log('local notification error', e);
    // }
  };

  return (
    <AppLayout
      showFooter={false}
      headerProps={{ title: t('title'), onBackPress: () => router.back() }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 24 }}>
          <LottieView
            source={require('../assets/app/login_animation.json')}
            autoPlay
            loop
            style={styles.lottie}
          />

          <PasscodePad
            title={t('pin_title')}
            subtitle={t('pin_subtitle')}
            pinLength={6}
            randomize
            fakePress
            onComplete={handleComplete}
          />
        </View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    backgroundColor: '#f9fafc',
  },
  lottie: {
    width: 300,
    height: 150,
    marginBottom: 12,
  },
});
