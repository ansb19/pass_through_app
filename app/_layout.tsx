// app/_layout.tsx

import { bootstrapI18n } from '@/src/locales/i18n';
import { useSignupStore } from '@/src/stores/signup_store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
// ✅ 추가
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/src/hooks/useColorScheme.web';
import { Platform } from 'react-native';

//✅ 포어그라운드 알림 표시 방식 (전역 1회)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // 앱 실행 중에도 배너/얼럿 노출
    shouldShowBanner: true, // 추가: 배너 표시
    shouldShowList: true,   // 추가: 알림 센터에 표시
    shouldPlaySound: true,  // 추가: 사운드 재생
    shouldSetBadge: true,   // 추가: 배지 업데이트
  }),
});

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

export default function RootLayout() {
  global.Buffer = require('buffer').Buffer;
  const reset = useSignupStore((s) => s.reset);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 스크린샷/녹화 차단
    ScreenCapture.preventScreenCaptureAsync();
    bootstrapI18n().finally(() => setReady(true));
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [reset]);

  // ✅ 알림 권한/채널/토큰 설정 (전역 1회)
  useEffect(() => {
    (async () => {
      if (!Device.isDevice) {
        // 시뮬레이터/웹에선 푸시 토큰 안나올 수 있음
        return;
      }

      // 권한 확인/요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('🔕 푸시 권한 거부됨');
      } else {
        // (선택) Expo Push Token 발급 → 원격 푸시 쓸 때만
        // EAS 사용 중이면 projectId가 들어있음
        const projectId =
          (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
          (Constants as any)?.easConfig?.projectId;

        if (projectId) {
          try {
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            const expoPushToken = tokenData.data;
            console.log('✅ Expo Push Token:', expoPushToken);

            // TODO: 원격 푸시 쓸 거면 서버에 등록
            // await fetch(`${API_BASE}/push/register`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ expoPushToken }),
            // });
          } catch (e) {
            console.log('Expo Push Token 발급 실패:', e);
          }
        }
      }

      // ANDROID 8.0+ 알림 채널 생성 (로컬/원격 공통)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [100, 100],
          // sound: 'default', // 커스텀 사운드 쓰려면 파일 추가
        });
      }
    })();
  }, []);

  if (!loaded) return null;
  if (!ready) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        {/* <Stack.Screen name="(tabs)" /> */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
