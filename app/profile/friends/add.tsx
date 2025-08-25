import AppLayout from '@/app/_components/AppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FriendAddScreen() {
  const [code, setCode] = useState('');
  const { t } = useTranslation('friends_add');

  const onScanQR = () => {
    // TODO: QR 스캔 화면으로 이동
    router.push('/qr'); // 프로젝트의 QR 스캔 경로에 맞게 변경
  };

  const onSearch = () => {
    if (!code.trim()) {
      Alert.alert(t('alert_empty_title'), t('alert_empty_message'));
      return;
    }
    // TODO: API 요청하여 친구 추가
    Alert.alert(t('alert_success_title'), t('alert_success_message', { code }));
    setCode('');
  };

  return (
    <AppLayout
      headerProps={{
        title: t('title'),
        onBackPress: () => router.back(),
      }}
    >
      <View style={s.wrap}>
        {/* QR 스캔으로 추가 */}
        <Pressable style={s.qrBtn} onPress={onScanQR}>
          <Ionicons name="qr-code-outline" size={28} color="#2563eb" />
          <Text style={s.qrBtnText}>{t('qr_add')}</Text>
        </Pressable>

        {/* 코드/아이디로 추가 */}
        <View style={s.inputWrap}>
          <Text style={s.label}>{t('label_code')}</Text>
          <TextInput
            style={s.input}
            placeholder={t('placeholder_code')}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
          />
          <Pressable style={s.addBtn} onPress={onSearch}>
            <Text style={s.addBtnText}>{t('add')}</Text>
          </Pressable>
        </View>
      </View>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 20 },

  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  qrBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '600' },

  inputWrap: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  addBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
