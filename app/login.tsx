import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import AppLayout from './components/AppLayout';
import PasscodePad from './components/PasscodePad';


export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const handleComplete = async (pin: string) => {
    // ⚠️ PIN은 화면/로그에 노출하지 말 것
    // TODO: 여기서 PIN 검증 or 파생키 생성(KDF) 등 처리

    // 생체 인증(선택)
    const hasHW = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHW && enrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric_prompt'),
        disableDeviceFallback: true,
      });
      if (!result.success) {
        // 실패 처리 (필요 시 진동/토스트)
        return;
      }
    }

    // 성공 → 홈으로 전환(뒤로가기로 로그인 못 돌아오게 replace 권장)
    router.replace('/home');
  };

  return (
    <AppLayout
      showHeader
      showFooter={false}
      headerProps={{ title: t('title'), showBack: true, onBackPress: () => router.back() }}
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
