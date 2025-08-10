import { useColorScheme } from '@/hooks/useColorScheme';
import { bootstrapI18n } from '@/src/locales/i18n';
import { useSignupStore } from '@/src/stores/signup_store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';


export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  // 추가 route...
};

export default function RootLayout() {
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
      // (선택) 앱 종료나 화면 빠져나갈 때 허용할 수 있음
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [reset]);

  if (!loaded) {
    return null;
  }
  if (!ready) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
