import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const Secure = {
  get: (k: string) => SecureStore.getItemAsync(k),
  set: (k: string, v: string) =>
    Platform.OS === 'ios'
      ? SecureStore.setItemAsync(k, v, { keychainService: 'pass_through' })
      : SecureStore.setItemAsync(k, v),
  del: (k: string) => SecureStore.deleteItemAsync(k),
};
