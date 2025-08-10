// components/LanguageSwitcherOne.tsx
import { setAppLanguage } from '@/src/locales/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetIOS, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LanguageSwitcherOne() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ko') ? 'ko' : 'en';
  const next = lang === 'ko' ? 'en' : 'ko';

  const apply = useCallback(async (code: 'ko' | 'en') => {
    await setAppLanguage(code);
  }, []);

  const onPress = useCallback(() => {
    // 단일 탭: ko ↔ en 즉시 토글
    apply(next);
  }, [apply, next]);

  const onLongPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['한국어', 'English', '취소'],
          cancelButtonIndex: 2,
          userInterfaceStyle: 'light',
        },
        (idx) => {
          if (idx === 0) apply('ko');
          if (idx === 1) apply('en');
        }
      );
    } else {
      // 안드로이드에선 길게누르기 동작 없이 즉시 토글 유지 (원하면 Modal로 확장)
    }
  }, [apply]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel="Change language"
      accessibilityHint="Tap to toggle between Korean and English"
    >
      <Ionicons name="globe-outline" size={18} color="#0f172a" />
      <View style={{ width: 6 }} />
      <Text style={styles.text}>{lang === 'ko' ? 'KR' : 'EN'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
});
