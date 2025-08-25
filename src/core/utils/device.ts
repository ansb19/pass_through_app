import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export async function getDeviceId() {
  return Application.getAndroidId ?? Constants.deviceId ?? 'unknown';
}
export function getAppVersion() {
  return Constants.expoConfig?.version ?? '0.0.0';
}
export function getDeviceInfo() {
  return `${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`.trim();
}
