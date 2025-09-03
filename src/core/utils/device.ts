import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function getDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    const androidId = await Application.getAndroidId();
    return androidId ?? 'unknown-android';
  }
  if (Platform.OS === 'ios') {
    const iosId = await Application.getIosIdForVendorAsync();
    return iosId ?? 'unknown-ios';
  }
  return 'unknown-device';
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export function getDeviceInfo(): string {
  return `${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`.trim();
}
