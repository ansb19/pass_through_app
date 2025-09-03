// app/signup/step3.tsx (권장 파일명)

import { generateMasterKey, wrapMasterKeyWithPin } from '@/src/core/crypto/keystore';
import { Secure } from '@/src/core/storage/secureStore';
import { getAppVersion, getDeviceId, getDeviceInfo } from '@/src/core/utils/device';
import { DeviceService } from '@/src/domains/device/services/device.service';
import { UserService } from '@/src/domains/user';
import { useSignupStore } from '@/src/stores/signup_store';
import { useRouter } from 'expo-router';
import type { TFunction } from 'i18next'; // ✅ 추가
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AppLayout from '../_components/AppLayout';
import PasscodePad from '../_components/PasscodePad';

function normalizeDigits(input?: string | null) {
  if (!input) return '';
  return String(input).replace(/\D/g, '');
}

// ✅ t를 TFunction으로 받고, 내부에서 defaultValue 옵션을 사용
function validatePinPolicyI18n(
  t: TFunction,
  pin: string,
  birthDate?: string | null
): string | null {
  const birth = normalizeDigits(birthDate);

  if (birth.length >= 6) {
    const yyMMdd = birth.slice(-6);
    if (pin.includes(yyMMdd)) {
      return t('signup_pin:policy_birth_yyMMdd', {
        defaultValue: '생년월일(YYMMDD)이 포함된 PIN은 사용할 수 없습니다.',
      });
    }
  }
  if (birth.length >= 4) {
    const mmdd = birth.slice(-4);
    if (pin.includes(mmdd)) {
      return t('signup_pin:policy_birth_mmdd', {
        defaultValue: '생년월일(MMDD)이 포함된 PIN은 사용할 수 없습니다.',
      });
    }
  }

  const isSequentialAsc = (a: number, b: number, c: number) => b === a + 1 && c === b + 1;
  const isSequentialDesc = (a: number, b: number, c: number) => b === a - 1 && c === b - 1;

  for (let i = 0; i <= pin.length - 3; i++) {
    const a = Number(pin[i]);
    const b = Number(pin[i + 1]);
    const c = Number(pin[i + 2]);
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) continue;

    if (pin[i] === pin[i + 1] && pin[i + 1] === pin[i + 2]) {
      return t('signup_pin:policy_repeated', {
        defaultValue: '같은 숫자가 3회 이상 연속되는 PIN은 사용할 수 없습니다.',
      });
    }
    if (isSequentialAsc(a, b, c) || isSequentialDesc(a, b, c)) {
      return t('signup_pin:policy_sequence', {
        defaultValue: '연속된 숫자(오름/내림) 3자리가 포함된 PIN은 사용할 수 없습니다.',
      });
    }
  }
  return null;
}

export default function SignupStepThreeScreen() {
  const router = useRouter();
  const setField = useSignupStore((s) => s.setField);
  const { nickname, email, emailVerified, phone, phoneVerified, birthDate } = useSignupStore();
  const { t } = useTranslation(['signup_pin', 'common']);

  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState('');
  const [padKey, setPadKey] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);            // ✅ 로딩 추가
  const handlingRef = useRef(false);

  const td = (key: string, def: string) => t(key, { defaultValue: def }); // ✅ 헬퍼

  const subtitle = useMemo(
    () =>
      step === 1
        ? td(
          'signup_pin:enter_sub_1',
          '숫자 키패드는 매번 섞여 표시됩니다\n(생년월일·연속 3자리 숫자 사용 불가)'
        )
        : td(
          'signup_pin:enter_sub_2',
          '동일한 PIN 번호를 입력해야 합니다\n(생년월일·연속 3자리 숫자 사용 불가)'
        ),
    [step, t]
  );

  const resetPad = () => setPadKey((k) => k + 1);

  const handleComplete = async (pin: string) => {
    if (handlingRef.current) return;

    // 1) PIN 정책 체크
    const policyError = validatePinPolicyI18n(t as any, pin, birthDate);
    if (policyError) {
      Alert.alert(td('signup_pin:policy_title', 'PIN 보안 정책'), policyError);
      resetPad();
      return;
    }

    // 2) 두 번 입력 확인
    if (step === 1) {
      setFirstPin(pin);
      setStep(2);
      resetPad();
      return;
    }
    if (pin !== firstPin) {
      Alert.alert(
        td('signup_pin:mismatch_title', 'PIN 불일치'),
        td('signup_pin:mismatch_body', '입력하신 두 PIN 번호가 다릅니다. 다시 시도해주세요.')
      );
      setFirstPin('');
      setStep(1);
      resetPad();
      return;
    }

    // 3) 서버 회원가입 호출 플로우
    handlingRef.current = true;
    setLoading(true);
    try {
      // (0) 가입 전제 조건 체크 (선택)
      if (!emailVerified && !phoneVerified) {
        throw new Error('이메일/휴대폰 인증이 필요합니다.');
      }
      if (!nickname || (!email && !phone)) {
        throw new Error('가입 정보가 충분하지 않습니다.');
      }

      // (A) 마스터키 생성 (클라 전용 키)
      const masterKey = await generateMasterKey(); // Uint8Array(32)

      // (B) PIN으로 마스터키 랩핑(enc 번들 생성) — 서버에 저장될 것
      const enc = await wrapMasterKeyWithPin(pin, masterKey);

      console.log("회원가입 요청");
      // (C) 서버에 회원가입 요청 (enc 포함)
      const user = await UserService.signUp({
        email: email!,                        // 서버 DTO에 맞춰 선택적으로 입력
        phone: phone!,
        nickname: nickname!,
        birth: birthDate!,
        enc,
      });

      // (D) 로컬 보안영역에 마스터키 저장 (서버는 복호화 불가, 앱만 사용)
      //     저장 시 base64로 인코딩해서 보관하는게 편함
      const mkBase64 = Buffer.from(masterKey).toString('base64');
      await Secure.set('MASTER_KEY', mkBase64);
      await Secure.set('USER_ID', user.id);

      //보안: masterKey 메모리 초기화
      masterKey.fill(0);

      // const deviceId = await getDeviceId();
      // const appVersion = getAppVersion();
      // const deviceInfo = getDeviceInfo();


      // const device = await DeviceService.register({
      //   device_id: deviceId,
      //   device_name: deviceInfo,
      //   user_id: user.id,
      //   app_version: appVersion,
      // });

      // await Secure.set('DEVICE_ID', deviceId);      // OS 단말 ID
      // await Secure.set('DEVICE_BIND', device.id);   // 서버 DB PK

      // (E) 메모리 클리어 (가능한 한 빠르게 민감값 제거)
      setField('pin', undefined);
      setFirstPin('');
      setCompleted(true);

      // 5) 기기 등록 로직
      const deviceId = await getDeviceId();
      const appVersion = getAppVersion();
      const deviceInfo = getDeviceInfo();

      const device = await DeviceService.register({
        device_id: deviceId,
        device_name: deviceInfo,
        user_id: user.id,
        app_version: appVersion,
      });

      await Promise.all([
        Secure.set('DEVICE_ID', deviceId),
        Secure.set('DEVICE_BIND', device.id),
      ]);


      const uid = await Secure.get('USER_ID');
      const did = await Secure.get('DEVICE_BIND');
      console.log('저장된 값:', { uid, did });

      // (F) 알림 및 이동
      Alert.alert(
        td('signup_pin:done_title', '회원가입 완료'),
        td('signup_pin:done_body', '회원가입을 축하드립니다. \n입력하신 PIN 번호는 안전하게 저장되었습니다.'),
        [{ text: td('common:ok', '확인'), onPress: () => router.replace('/welcome') }]
      );


    } catch (e: any) {
      console.error(e);
      Alert.alert(
        td('common:error', '오류'),
        e?.message ?? td('signup_pin:unknown_error', '회원가입 중 알 수 없는 오류가 발생했습니다.')
      );
      // 실패 시 초기화
      setFirstPin('');

      setStep(1);
      resetPad();
    } finally {
      // PIN은 더 이상 쓰지 않으니 즉시 메모리에서 제거
      handlingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <AppLayout
      showFooter={false}
      headerProps={{ title: td('signup_pin:title', 'PIN 설정'), onBackPress: () => router.back() }}
    >
      <View style={s.container}>
        {nickname ? (
          <Text style={s.caption}>
            {nickname} {td('signup_pin:name_suffix', '님')}
          </Text>
        ) : null}

        {(emailVerified && email) || (phoneVerified && phone) || birthDate ? (
          <Text style={s.subcaption}>
            {emailVerified && email ? `${td('signup_pin:email_verified_label', '이메일 확인됨')}: ${email}\n` : ''}
            {phoneVerified && phone ? `${td('signup_pin:phone_verified_label', '휴대폰 확인됨')}: ${phone}\n` : ''}
            {birthDate ? `${td('signup_pin:birth_date_label', '생년월일')}: ${birthDate}` : ''}
          </Text>
        ) : null}

        {!completed && (
          <PasscodePad
            key={`${step}-${padKey}`}
            title={
              step === 1
                ? td('signup_pin:enter_title_1', 'PIN 번호 6자리를 입력해주세요')
                : td('signup_pin:enter_title_2', '다시 한 번 PIN 번호를 입력해주세요')
            }
            subtitle={subtitle}
            pinLength={6}
            randomize
            fakePress
            onComplete={handleComplete}
            style={{ marginTop: 12 }}
            disabled={loading}
          />
        )}
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 24 },
  caption: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subcaption: { fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 18 }
});
