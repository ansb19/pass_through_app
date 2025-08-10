import { useSignupStore } from '@/src/stores/signup_store';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AppLayout from '../components/AppLayout';
import PasscodePad from '../components/PasscodePad';

function normalizeDigits(input?: string | null) {
  if (!input) return '';
  return String(input).replace(/\D/g, '');
}

function validatePinPolicy(pin: string, birthDate?: string | null): string | null {
  const birth = normalizeDigits(birthDate);
  if (birth.length >= 6) {
    const yyMMdd = birth.slice(-6);
    if (pin.includes(yyMMdd)) return '생년월일(YYMMDD)이 포함된 PIN은 사용할 수 없습니다.';
  }
  if (birth.length >= 4) {
    const mmdd = birth.slice(-4);
    if (pin.includes(mmdd)) return '생년월일(MMDD)이 포함된 PIN은 사용할 수 없습니다.';
  }

  const isSequentialAsc = (a: number, b: number, c: number) => b === a + 1 && c === b + 1;
  const isSequentialDesc = (a: number, b: number, c: number) => b === a - 1 && c === b - 1;

  for (let i = 0; i <= pin.length - 3; i++) {
    const a = Number(pin[i]);
    const b = Number(pin[i + 1]);
    const c = Number(pin[i + 2]);
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) continue;

    if (pin[i] === pin[i + 1] && pin[i + 1] === pin[i + 2]) {
      return '같은 숫자가 3회 이상 연속되는 PIN은 사용할 수 없습니다.';
    }
    if (isSequentialAsc(a, b, c) || isSequentialDesc(a, b, c)) {
      return '연속된 숫자(오름/내림) 3자리가 포함된 PIN은 사용할 수 없습니다.';
    }
  }
  return null;
}

export default function SignupStepTwoScreen() {
  const router = useRouter();
  const setField = useSignupStore((s) => s.setField);
  const { nickname, email, emailVerified, phone, phoneVerified, birthDate } = useSignupStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState('');
  const [padKey, setPadKey] = useState(0);         // ✅ PasscodePad 강제 리마운트 키
  const [completed, setCompleted] = useState(false); // ✅ 최종 성공 시 키패드 언마운트
  const handlingRef = useRef(false);               // ✅ 중복 실행 가드

  const subtitle = useMemo(() => {
    return step === 1
      ? '숫자 키패드는 매번 섞여 표시됩니다\n(생년월일·연속 3자리 숫자 사용 불가)'
      : '동일한 PIN 번호를 입력해야 합니다\n(생년월일·연속 3자리 숫자 사용 불가)';
  }, [step]);

  const resetPad = () => setPadKey((k) => k + 1);

  const handleComplete = async (pin: string) => {
    if (handlingRef.current) return; // 중복 방지

    // 정책 검증
    const policyError = validatePinPolicy(pin, birthDate);
    if (policyError) {
      Alert.alert('PIN 보안 정책', policyError);
      resetPad(); // ❗️규칙 위반 시 즉시 키패드 초기화
      return;
    }

    if (step === 1) {
      setFirstPin(pin);
      setStep(2);
      resetPad(); // ❗️2차 입력을 위해 키패드 초기화
      return;
    }

    // step === 2
    if (pin !== firstPin) {
      Alert.alert('PIN 불일치', '입력하신 두 PIN 번호가 다릅니다. 다시 시도해주세요.');
      setFirstPin('');
      setStep(1);
      resetPad(); // ❗️불일치 시 초기화
      return;
    }

    // 최종 성공
    handlingRef.current = true; // ❗️추가 트리거 차단
    setField('pin', pin);
    setCompleted(true);         // ❗️키패드 언마운트 → onComplete 재호출 원천 차단

    Alert.alert(
      '회원가입 완료',
      '회원가입을 축하드립니다. \n입력하신 PIN 번호는 안전하게 저장되었습니다.',
      [
        // 필요에 따라 바로 다음 단계로 이동
        { text: '확인', onPress: () => router.replace('/home') },
        // { text: '확인', onPress: () => {} },
      ],
    );
  };

  return (
    <AppLayout
      showHeader
      showFooter={false}
      headerProps={{ title: 'PIN 설정', showBack: true, onBackPress: () => router.back() }}
    >
      <View style={s.container}>
        {nickname ? <Text style={s.caption}>{nickname} 님</Text> : null}
        {(emailVerified && email) || (phoneVerified && phone) || birthDate ? (
          <Text style={s.subcaption}>
            {emailVerified && email ? `이메일 확인됨: ${email}\n` : ''}
            {phoneVerified && phone ? `휴대폰 확인됨: ${phone}\n` : ''}
            {birthDate ? `생년월일: ${birthDate}` : ''}
          </Text>
        ) : null}

        {!completed && (
          <PasscodePad
            key={`${step}-${padKey}`}     // ❗️리렌더 시마다 새로 마운트
            title={step === 1 ? 'PIN 번호 6자리를 입력해주세요' : '다시 한 번 PIN 번호를 입력해주세요'}
            subtitle={subtitle}
            pinLength={6}
            randomize={true}
            fakePress={true}
            onComplete={handleComplete}
            style={{ marginTop: 12 }}
          />
        )}
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 24 },
  caption: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subcaption: { fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 18 },
});
