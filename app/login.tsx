import { Secure } from '@/src/core/storage/secureStore';
import { AuthService } from '@/src/domains/auth/services/auth.service';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import AppLayout from './_components/AppLayout';
import PasscodePad from './_components/PasscodePad';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');

  const handleComplete = async (pin: string) => {
    try {
      const user_id = await Secure.get('USER_ID');
      const device_bind = await Secure.get('DEVICE_BIND');

      if (!user_id || !device_bind) {
        Alert.alert('로그인 실패', '저장된 사용자 또는 기기 정보가 없습니다.');
        return;
      }

      // ✅ AuthService.login에 모든 절차 위임
      const result = await AuthService.login(user_id, device_bind, pin, true);

      if (!result.ok) {
        Alert.alert('로그인 실패', result.message ?? '다시 시도해 주세요.');
        return;
      }

      // ✅ 성공 → 홈으로 이동
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message ?? '다시 시도해 주세요.');
    }
  };

  return (
    <AppLayout
      showFooter={false}
      headerProps={{ title: t('title'), onBackPress: () => router.back() }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
