// components/LanguageSwitcher.tsx
import { setAppLanguage } from '@/src/i18n';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
;

export default function LanguageSwitcher() {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.btn} onPress={() => setAppLanguage('ko')}>
        <Text style={styles.text}>한국어</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => setAppLanguage('en')}>
        <Text style={[styles.text, styles.primaryText]}>English</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8, alignSelf: 'flex-end', paddingHorizontal: 16, paddingTop: 12 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#f1f5f9' },
  text: { fontWeight: '600', color: '#0f172a' },
  primary: { backgroundColor: '#0050b8' },
  primaryText: { color: '#fff' },
});
