import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppLayout from './components/AppLayout';

const { width } = Dimensions.get('window');

export default function LoginPinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [digits, setDigits] = useState<number[]>([]);
  const [pressedKeys, setPressedKeys] = useState<number[]>([]);

  const PIN_LENGTH = 6;

  useEffect(() => {
    shuffleDigits();
  }, []);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handlePinComplete(pin);
    }
  }, [pin]);

  const shuffleDigits = () => {
    const nums = [...Array(10).keys()];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setDigits(nums);
  };

  const handleDigitPress = (digit: number) => {
    if (pin.length >= PIN_LENGTH) return;

    Haptics.selectionAsync(); // ← 진동 발생
    // 가짜 눌림 숫자 생성 (2~3개)
    const fakeKeys = digits
      .filter((d) => d !== digit)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const keysToFlash = [digit, ...fakeKeys];
    setPressedKeys(keysToFlash);

    // 150ms 후 눌림 효과 제거
    setTimeout(() => {
      setPressedKeys([]);
    }, 150);

    setPin((prev) => prev + digit.toString());
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handlePinComplete = async (pin: string) => {
    // 1. Alert로 먼저 "PIN 확인 완료" 알림
    Alert.alert('PIN 입력 완료', `입력한 PIN: ${pin}`, [
      {
        text: '확인',
        onPress: async () => {
          // 2. 지문 사용 가능한지 체크
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();

          if (!hasHardware || !isEnrolled) {
            Alert.alert('지문 인증 불가', '지문 인식 센서가 없거나 등록된 지문이 없습니다.');
            resetPin();
            return;
          }

          // 3. 지문 인증 시도
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: '지문으로 인증해주세요',
            fallbackLabel: '비밀번호 사용',
            disableDeviceFallback: true, // 생체 인증만 허용
          });

          if (result.success) {
            Alert.alert('지문 인증 성공');
            // TODO: 다음 로그인 단계로 이동
          } else {
            Alert.alert('지문 인증 실패', '지문 인증에 실패했습니다.');
          }

          resetPin();
        },
      },
    ]);
  };

  const resetPin = () => {
    setPin('');
    shuffleDigits();
  };

  const renderPinBoxes = () => {
    return Array.from({ length: PIN_LENGTH }).map((_, i) => (
      <View key={i} style={[styles.pinBox, pin.length === i && styles.activePinBox]}>
        <Text style={styles.pinText}>{pin[i] ? '●' : ''}</Text>
      </View>
    ));
  };

  const renderKeypad = () => {
    // 앞 9개는 그대로
    const firstNine = digits.slice(0, 9);
    const lastDigit = digits[9]; // 마지막 숫자 1개

    return (
      <View style={styles.keypad}>
        {/* 첫 3줄 (숫자 0~8) */}
        {firstNine.map((digit) => (
          <TouchableOpacity
            key={digit}
            style={[
              styles.key,
              pressedKeys.includes(digit) && styles.keyPressed,
            ]}
            activeOpacity={1}
            onPress={() => handleDigitPress(digit)}
          >
            <View style={styles.keyContent}>
              <Text style={styles.keyText}>{digit}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* 마지막 줄: 전체삭제 / 마지막 숫자 / ⌫ */}
        <TouchableOpacity
          style={[styles.key, styles.clear]}
          onPress={() => setPin('')}
        >
          <View style={styles.keyContent}>
            <Text style={[styles.keyText, { fontSize: 16 }]}>전체삭제</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          key={lastDigit}
          style={[
            styles.key,
            pressedKeys.includes(lastDigit) && styles.keyPressed,
          ]}
          activeOpacity={1}
          onPress={() => handleDigitPress(lastDigit)}
        >
          <View style={styles.keyContent}>
            <Text style={styles.keyText}>{lastDigit}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.key, styles.backspace]}
          onPress={handleBackspace}
        >
          <View style={styles.keyContent}>
            <Text style={[styles.keyText, { fontSize: 20 }]}>⌫</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <AppLayout
      showHeader={true}
      showFooter={false}
      headerProps={{
        title: '로그인',
        showBack: true,
        onBackPress: () => router.back(),
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <LottieView
            source={require('../assets/app/login_animation.json')}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.title}>PIN 번호 6자리를 입력해주세요</Text>

          <View style={styles.pinRow}>{renderPinBoxes()}</View>

          {renderKeypad()}
        </View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#f9fafc',
  },
  lottie: {
    width: 300,
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 24,
    fontWeight: '600',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 14,
  },
  pinBox: {
    width: 40,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activePinBox: {
    borderColor: '#3b82f6',
    backgroundColor: '#e0f2fe',
  },
  pinText: {
    fontSize: 26,
    color: '#0f172a',
    fontWeight: '700',
  },
  keypad: {
    width: width * 0.85,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  key: {
    width: '30%',
    height: 60,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  keyPressed: {
    backgroundColor: '#bfdbfe',
    transform: [{ scale: 0.96 }],
  },
  keyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  backspace: {
    backgroundColor: '#fee2e2',
  },
  clear: {
    backgroundColor: '#e2e8f0', // 연한 회색 (다른 키랑 구분)
  },
});


