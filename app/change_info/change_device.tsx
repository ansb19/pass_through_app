// app/change_info/change_device.tsx
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppLayout from '../components/AppLayout';

export default function ChangeDeviceScreen() {  // ← default export
  return (
    <AppLayout 
    showHeader={true}
      showFooter={false}
      headerProps={{
        title: '내 기기 찾기',
        showBack: true,
        onBackPress: () => router.back(),
      }}>
      <View style={styles.container}>
        <Text>내 기기 찾기</Text>
      </View>
    </AppLayout>
  );
}
const styles = StyleSheet.create({ container:{ flex:1, alignItems:'center', justifyContent:'center' }});
