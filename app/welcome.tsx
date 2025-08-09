import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from './_layout';
import AppLayout from './components/AppLayout';


const { width } = Dimensions.get('window');
type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const router = useRouter();
  return (
    <AppLayout
      showHeader={false}
      showFooter={false}
      headerProps={{
        title: 'pass through',
      }}
    >
      <View style={styles.content}>
        {/* pass_through 대표 이미지/로고 */}
        <Image
          source={require("../assets/app/icon.png")} // 준비한 로고 파일 경로로 변경
          style={styles.logo}
          resizeMode="contain"
        />
        {/* <LottieView
          source={require('../assets/app/welcome_animation.json')}
          autoPlay
          loop
          style={{ width: 300, height: 300, marginBottom: 32 }}
        /> */}
        {/* 환영 메시지 */}
        <Text style={styles.title}>Welcome to pass through</Text>
        <Text style={styles.desc}>
          안전하게, 간편하게
          내 소중한 정보를 관리하세요.
        </Text>
        {/* 버튼 그룹 */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => router.push('/signup/step1')}
          >
            <Text style={styles.signupBtnText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
    backgroundColor: '#f8fafc',
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: 32,
    borderRadius: 40,
    shadowColor: '#001f3f',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    backgroundColor: '#fff',
    elevation: 10, // Android
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#001f3f',
    marginBottom: 10,
    letterSpacing: -1,
  },
  desc: {
    fontSize: 16,
    color: '#51606f',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  loginBtn: {
    width: width * 0.8,
    backgroundColor: '#0050b8',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0050b8',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  signupBtn: {
    width: width * 0.8,
    backgroundColor: '#e6eaf2',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  signupBtnText: {
    color: '#0050b8',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
});
