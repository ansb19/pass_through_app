import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// JSON 파일 임포트
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enQr from './locales/en/qr.json';
import enSignup from './locales/en/sign_up.json';

import koAuth from './locales/ko/auth.json';
import koCommon from './locales/ko/common.json';
import koHome from './locales/ko/home.json';
import koQr from './locales/ko/qr.json';
import koSignup from './locales/ko/sign_up.json';

const STORAGE_KEY = 'app_language';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      qr: enQr,
      sign_up: enSignup,
      home: enHome,
    },
    ko: {
      common: koCommon,
      auth: koAuth,
      qr: koQr,
      sign_up: koSignup,
      home: koHome,
    },
  },
  ns: ['common', 'auth', 'qr', 'sign_up', 'home'],
  defaultNS: 'common',
  lng: 'ko',           // 앱 기본 언어
  fallbackLng: 'en',   // 없는 경우 영어
  interpolation: { escapeValue: false },
});

export async function bootstrapI18n() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const sysLang = Localization.getLocales?.()[0]?.languageCode;
  const initial = saved || (sysLang === 'ko' ? 'ko' : 'en');
  await i18n.changeLanguage(initial);
}

export async function setAppLanguage(lang: 'en' | 'ko') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(STORAGE_KEY, lang);
}

export default i18n;
