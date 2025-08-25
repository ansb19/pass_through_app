//로딩화면 애니메이션
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  const { t } = useTranslation();
  const displayMessage = message ?? t('common.loading');
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    return () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  }, [opacity]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/app/loading_animation.json')} // 경로 조정
          autoPlay
          loop
          style={{ width: 200, height: 200, marginBottom: 24 }}
        />
        <ActivityIndicator size="large" color="#0050b8" />
        <Text style={styles.message}>{displayMessage}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // 화면 전체 덮기
    backgroundColor: 'rgba(255,255,255,0.6)', // ✅ 반투명 흰색
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // 위에 표시
  },
  content: {
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});
