//KBA(추가 확인) 폼
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import FormCard from './FormCard';

export type KBAItem = { key: string; label: string };

type Props = {
  title: string;
  desc?: string;
  kbaList: KBAItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  answer: string;
  onChangeAnswer: (v: string) => void;
  onConfirm: () => void;
  confirmLabel: string;
  secureWhenKeys?: string[]; // 예: ['last4']
  placeholder?: string;
  style?: ViewStyle;
};

export default function KBAForm({
  title,
  desc,
  kbaList,
  selectedKey,
  onSelect,
  answer,
  onChangeAnswer,
  onConfirm,
  confirmLabel,
  secureWhenKeys = ['last4'],
  placeholder = '',
  style,
}: Props) {
  const secure = !!(selectedKey && secureWhenKeys.includes(selectedKey));
  return (
    <FormCard title={title} desc={desc} style={style}>
      <View style={s.segWrap}>
        {kbaList.map(k => (
          <TouchableOpacity
            key={k.key}
            style={[s.segBtn, selectedKey === k.key && s.segBtnActive]}
            onPress={() => onSelect(k.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.segText, selectedKey === k.key && s.segTextActive]}>{k.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={answer}
        onChangeText={onChangeAnswer}
        placeholder={placeholder}
        keyboardType="default"
        secureTextEntry={secure}
        style={s.input}
      />

      <TouchableOpacity style={s.primaryBtn} onPress={onConfirm} activeOpacity={0.85}>
        <Text style={s.primaryText}>{confirmLabel}</Text>
      </TouchableOpacity>
    </FormCard>
  );
}

const s = StyleSheet.create({
  segWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  segBtnActive: { backgroundColor: '#eef2ff' },
  segText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  segTextActive: { color: '#1d4ed8' },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0b62ff',
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
});
