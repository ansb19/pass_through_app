import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../_components/AppLayout';


const { width } = Dimensions.get('window');

export default function ChangeInfoScreen() {
  const router = useRouter();
  const {t} = useTranslation();

  return (
    <AppLayout
      showFooter={false}
      headerProps={{
        title: t('change_info'),
        
        onBackPress: () => router.back(),
      }}
    >
      <View style={styles.container}>
        {/* 내 기기 변경 */}
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => router.push('./change_info/change_device')}
        >
          <Text style={styles.mainBtnText}>{t('change_device')}</Text>
        </TouchableOpacity>

        {/* PIN 번호 변경 */}
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => router.push('./change_info/change_pin')}
        >
          <Text style={styles.mainBtnText}>{t('change_pin')}</Text>
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 16, // 버튼 간격
  },
  mainBtn: {
    width: width * 0.8,
    backgroundColor: '#0050b8',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0050b8',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  mainBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: -0.5,
  },
});
