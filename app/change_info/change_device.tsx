// app/change_info/change_device/index.tsx
import { requireBiometric } from '@/src/domains/auth/requireBiometric';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import AppLayout from '../_components/AppLayout';
import FormCard from '../_components/FormCard'; // server_check/done용
import IdentityForm from '../_components/IdentityForm';
import KBAForm from '../_components/KBAForm';
import OtpVerifyForm from '../_components/OtpVerifyForm';
import PasscodePad from '../_components/PasscodePad';

type Step = 'otp_identity' | 'otp_verify' | 'pin_bio' | 'server_check' | 'kba' | 'done';

const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
const isPhone = (v: string) => /^[0-9+\-()\s]{8,20}$/.test(v);
const maskEmail = (e: string) => {
  const [id, domain] = e.split('@');
  if (!domain) return e;
  const head = id.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, id.length - 2))}@${domain}`;
};
const digitsOnly = (s: string) => s.replace(/\D/g, '');
const maskPhone = (p: string) => {
  const d = digitsOnly(p);
  if (d.length < 7) return p.replace(/.(?=.{2})/g, '*');
  return `${d.slice(0, 3)}-${'*'.repeat(Math.max(2, d.length - 5))}-${d.slice(-2)}`;
};

/** mock API */
async function apiSendOtpToIdentity(identity: { type: 'email' | 'sms', value: string }) {
  await new Promise(r => setTimeout(r, 220));
  return { ok: true, txId: 'otp_tx_123', expiresInSec: 300 };
}
async function apiVerifyOtp(txId: string, code: string) {
  await new Promise(r => setTimeout(r, 180));
  return { ok: code.length === 6 };
}
async function apiVerifyPin(pin: string) {
  await new Promise(r => setTimeout(r, 120));
  return pin.length === 6;
}
async function apiFetchAccountAndDevice() {
  await new Promise(r => setTimeout(r, 200));
  return {
    ok: true,
    kbaCandidates: [
      { key: 'birth', label: '생년월일 (YYYY-MM-DD)' },
      { key: 'zip', label: '우편번호' },
      { key: 'last4', label: '주민등록번호 뒤 4자리' }
    ] as { key: string; label: string }[],
  };
}
async function apiVerifyKBA(key: string, val: string) {
  await new Promise(r => setTimeout(r, 200));
  return { ok: val.trim().length >= 3 };
}
async function apiFinalizeChange() {
  await new Promise(r => setTimeout(r, 200));
  return { ok: true };
}

export default function ChangeDeviceScreen() {
  const { t } = useTranslation(['auth', 'change']);
  const [step, setStep] = useState<Step>('otp_identity');

  const [identity, setIdentity] = useState('');
  const [identityType, setIdentityType] = useState<'email' | 'sms' | null>(null);
  const [otpTx, setOtpTx] = useState<{ txId: string; expiresAt: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [otp, setOtp] = useState('');

  const submitIdentity = useCallback(async () => {
    const v = identity.trim();
    const type: 'email' | 'sms' | null = isEmail(v) ? 'email' : (isPhone(v) ? 'sms' : null);
    if (!type) {
      Alert.alert(t('auth:identity_invalid_title'), t('auth:identity_invalid_desc'));
      return;
    }
    const res = await apiSendOtpToIdentity({ type, value: v });
    if (!res.ok) {
      Alert.alert(t('auth:otp_send_fail'));
      return;
    }
    setIdentityType(type);
    setOtp('');
    setOtpTx({ txId: res.txId, expiresAt: Date.now() + res.expiresInSec * 1000 });
    setStep('otp_verify');
  }, [identity, t]);

  useEffect(() => {
    if (step !== 'otp_verify' || !otpTx) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.floor((otpTx.expiresAt - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [step, otpTx]);

  const resendOtp = useCallback(async () => {
    if (!identityType) return;
    const res = await apiSendOtpToIdentity({ type: identityType, value: identity.trim() });
    if (!res.ok) {
      Alert.alert(t('auth:otp_send_fail'));
      return;
    }
    setOtp('');
    setOtpTx({ txId: res.txId, expiresAt: Date.now() + res.expiresInSec * 1000 });
  }, [identity, identityType, t]);

  const verifyOtp = useCallback(async () => {
    if (!otpTx) return;
    const res = await apiVerifyOtp(otpTx.txId, otp);
    if (!res.ok) {
      Alert.alert(t('auth:otp_invalid'));
      return;
    }
    setStep('pin_bio');
  }, [otpTx, otp, t]);

  const onCompletePin = useCallback(async (pin: string) => {
    const ok = await apiVerifyPin(pin);
    if (!ok) {
      Alert.alert(t('auth:pin_invalid'));
      return;
    }
    const bio = await requireBiometric(t('auth:biometric_prompt'));
    if (!bio.ok && !bio.fallbackToPin) {
      Alert.alert(t('auth:biometric_failed'));
      return;
    }
    setStep('server_check');
  }, [t]);

  const [kbaList, setKbaList] = useState<{ key: string; label: string }[]>([]);
  const [kbaKey, setKbaKey] = useState<string | null>(null);
  const [kbaAnswer, setKbaAnswer] = useState('');

  useEffect(() => {
    (async () => {
      if (step !== 'server_check') return;
      const res = await apiFetchAccountAndDevice();
      if (!res.ok) {
        Alert.alert(t('change:server_check_fail'));
        setStep('otp_identity');
        return;
      }
      setKbaList(res.kbaCandidates);
      setStep('kba');
    })();
  }, [step, t]);

  const confirmKBA = useCallback(async () => {
    if (!kbaKey) {
      Alert.alert(t('change:select_field'));
      return;
    }
    const res = await apiVerifyKBA(kbaKey, kbaAnswer);
    if (!res.ok) {
      Alert.alert(t('change:kba_mismatch'));
      return;
    }
    const fin = await apiFinalizeChange();
    if (fin.ok) {
      setStep('done');
      Alert.alert(
        t('change:done_title'),
        t('change:done_body'),
        [{ text: t('auth:ok'), onPress: () => router.replace('/home') }]
      );
    } else {
      Alert.alert(t('change:finalize_fail'));
    }
  }, [kbaKey, kbaAnswer, t]);

  const headerTitle = useMemo(() => {
    switch (step) {
      case 'otp_identity': return t('change:title_identity');
      case 'otp_verify': return t('change:title_otp');
      case 'pin_bio': return t('change:title_pin_bio');
      case 'server_check': return t('change:title_server');
      case 'kba': return t('change:title_kba');
      case 'done': return t('change:title_done');
      default: return t('change:device_change');
    }
  }, [step, t]);

  const maskedTarget = useMemo(() => {
    if (!identityType) return '';
    return identityType === 'email' ? maskEmail(identity.trim()) : maskPhone(identity.trim());
  }, [identityType, identity]);

  return (
    <AppLayout
      showFooter={false}
      headerProps={{ title: headerTitle, onBackPress: () => router.back() }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>
          <LottieView source={require('../../assets/app/login_animation.json')} autoPlay loop style={s.lottie} />

          {step === 'otp_identity' && (
            <IdentityForm
              title={t('auth:identity_title')}
              desc={t('auth:identity_desc')}
              value={identity}
              onChangeText={setIdentity}
              placeholder={t('auth:identity_placeholder')}
              submitLabel={t('auth:verify')}
              onSubmit={submitIdentity}
            />
          )}

          {step === 'otp_verify' && (
            <OtpVerifyForm
              title={t('auth:otp_input_title')}
              descPrefix={identityType === 'email' ? t('auth:otp_input_email') : t('auth:otp_input_sms')}
              maskedTarget={maskedTarget}
              otp={otp}
              onChangeOtp={setOtp}
              onVerify={verifyOtp}
              verifyLabel={t('auth:verify')}
              timeLeft={timeLeft}
              resendLabel={t('auth:resend')}
              onResend={resendOtp}
              changeIdentityLabel={t('auth:change_identity')}
              onChangeIdentity={() => { setStep('otp_identity'); setOtp(''); }}
            />
          )}

          {step === 'pin_bio' && (
            <PasscodePad
              title={t('auth:pin_title')}
              subtitle={t('auth:pin_subtitle')}
              pinLength={6}
              randomize
              fakePress
              onComplete={onCompletePin}
            />
          )}

          {step === 'server_check' && (
            <FormCard title={t('change:server_checking')} desc={t('change:server_check_desc')} />
          )}

          {step === 'kba' && (
            <KBAForm
              title={t('change:kba_title')}
              desc={t('change:kba_desc')}
              kbaList={kbaList}
              selectedKey={kbaKey}
              onSelect={setKbaKey}
              answer={kbaAnswer}
              onChangeAnswer={setKbaAnswer}
              onConfirm={confirmKBA}
              confirmLabel={t('change:confirm_and_change')}
              placeholder={t('change:kba_placeholder')}
              secureWhenKeys={['last4']}
            />
          )}

          {step === 'done' && (
            <FormCard title={t('change:done_title')} desc={t('change:done_body')} />
          )}
        </View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 24 },
  lottie: { width: 300, height: 150, marginBottom: 12 },
  card: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12, elevation: 1, shadowOpacity: 0.04 },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  desc: { fontSize: 13, color: '#374151', lineHeight: 20 },
  highlight: { fontWeight: '700', color: '#111' },
  input: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 15, color: '#111', backgroundColor: '#fafafa' },
  primaryBtn: { marginTop: 4, paddingVertical: 12, borderRadius: 10, backgroundColor: '#0b62ff', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  subtleBtn: { alignItems: 'center' },
  subtleText: { color: '#6b7280', fontWeight: '600' },
  timer: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  segWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f3f4f6' },
  segBtnActive: { backgroundColor: '#eef2ff' },
  segText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  segTextActive: { color: '#1d4ed8' }
});
