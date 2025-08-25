// src/locales/i18n.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/* =======================
 * EN JSON imports
 * ======================= */
import enAccountDelete from './en/account_delete.json';
import enAuth from './en/auth.json';
import enChange from './en/change.json';
import enCommon from './en/common.json';
import enFriendsAdd from './en/friends_add.json';
import enFriendsList from './en/friends_list.json';
import enHelpAdd from './en/help_add.json';
import enHelpIndex from './en/help_index.json';
import enHelpTicket from './en/help_ticket.json';
import enHome from './en/home.json';
import enPolicies from './en/policies.json';
import enProfile from './en/profile.json';
import enProfileForm from './en/profile_form.json';
import enProfileFriend from './en/profile_friend.json';
import enProfileHome from './en/profile_home.json';
import enQr from './en/qr.json';
import enReAuth from './en/re_auth.json';
import enShare from './en/share.json';
import enSignup from './en/signup.json';
import enSignupPin from './en/signup_pin.json';
import enVault from './en/vault.json';
import enVaultList from './en/vault.list.json'; // file name has a dot
import enVaultView from './en/vault.view.json'; // file name has a dot

/* =======================
 * KO JSON imports
 * ======================= */
import koAccountDelete from './ko/account_delete.json';
import koAuth from './ko/auth.json';
import koChange from './ko/change.json';
import koCommon from './ko/common.json';
import koFriendsAdd from './ko/friends_add.json';
import koFriendsList from './ko/friends_list.json';
import koHelpAdd from './ko/help_add.json';
import koHelpIndex from './ko/help_index.json';
import koHelpTicket from './ko/help_ticket.json';
import koHome from './ko/home.json';
import koPolicies from './ko/policies.json';
import koProfile from './ko/profile.json';
import koProfileForm from './ko/profile_form.json';
import koProfileFriend from './ko/profile_friend.json';
import koProfileHome from './ko/profile_home.json';
import koQr from './ko/qr.json';
import koReAuth from './ko/re_auth.json';
import koShare from './ko/share.json';
import koSignup from './ko/signup.json';
import koSignupPin from './ko/signup_pin.json';
import koVault from './ko/vault.json';
import koVaultList from './ko/vault.list.json'; // file name has a dot
import koVaultView from './ko/vault.view.json'; // file name has a dot

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
      policies: enPolicies,
      profile: enProfile,
      profile_form: enProfileForm,
      profile_friend: enProfileFriend,
      profile_home: enProfileHome,
      re_auth: enReAuth,
      change: enChange,
      help_ticket: enHelpTicket,
      help_add: enHelpAdd,
      help_index: enHelpIndex,
      friends_add: enFriendsAdd,
      friends_list: enFriendsList,
      account_delete: enAccountDelete,
      share: enShare,
      signup_pin: enSignupPin,
      vault: enVault,
      // files have dots, but we expose clean namespaces:
      vault_list: enVaultList,
      vault_view: enVaultView,
    },
    ko: {
      common: koCommon,
      auth: koAuth,
      qr: koQr,
      sign_up: koSignup,
      home: koHome,
      policies: koPolicies,
      profile: koProfile,
      profile_form: koProfileForm,
      profile_friend: koProfileFriend,
      profile_home: koProfileHome,
      re_auth: koReAuth,
      change: koChange,
      help_ticket: koHelpTicket,
      help_add: koHelpAdd,
      help_index: koHelpIndex,
      friends_add: koFriendsAdd,
      friends_list: koFriendsList,
      account_delete: koAccountDelete,
      share: koShare,
      signup_pin: koSignupPin,
      vault: koVault,
      // files have dots, but we expose clean namespaces:
      vault_list: koVaultList,
      vault_view: koVaultView,
    },
  },
  ns: [
    'common',
    'auth',
    'qr',
    'sign_up',
    'home',
    'policies',
    'profile',
    'profile_form',
    'profile_friend',
    'profile_home',
    're_auth',
    'change',
    'help_ticket',
    'help_add',
    'help_index',
    'friends_add',
    'friends_list',
    'account_delete',
    'share',
    'signup_pin',
    'vault',
    'vault_list',
    'vault_view',
  ],
  defaultNS: 'common',
  lng: 'ko',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export async function bootstrapI18n() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const sys = Localization.getLocales?.()[0];
  const sysLang =
    sys?.languageCode || sys?.languageTag?.split('-')?.[0] || 'en';
  const initial = (saved as 'en' | 'ko') || (sysLang === 'ko' ? 'ko' : 'en');
  await i18n.changeLanguage(initial);
}

export async function setAppLanguage(lang: 'en' | 'ko') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(STORAGE_KEY, lang);
}

export default i18n;
