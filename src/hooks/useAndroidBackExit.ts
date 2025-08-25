// hooks/useAndroidBackExit.ts
import { useFocusEffect } from 'expo-router';
import { useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';

type Opts = { enabled: boolean; onExit?: () => void };

export function useAndroidBackExit({ enabled, onExit }: Opts) {
  const lastPressRef = useRef(0);

  useFocusEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const now = Date.now();
      if (now - lastPressRef.current < 2000) {
        onExit?.();
        BackHandler.exitApp();
        return true;
      }
      lastPressRef.current = now;
      ToastAndroid.show('뒤로가기를 한 번 더 누르면 앱이 종료됩니다.', ToastAndroid.SHORT);
      return true; // 이벤트 소비(앱이 기본 동작으로 빠지지 않게)
    });

    return () => sub.remove();
  });
}
