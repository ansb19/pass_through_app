import * as SecureStore from 'expo-secure-store';

export const Secure = {
  get: (k: string) => SecureStore.getItemAsync(k),
  set: (k: string, v: string) => SecureStore.setItemAsync(k, v, { keychainService: 'pass_through' }),
  del: (k: string) => SecureStore.deleteItemAsync(k),
};
// 키: SESSION_ID, REFRESH_TOKEN, DEVICE_BIND
