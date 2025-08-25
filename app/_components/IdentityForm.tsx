//식별값 입력 폼 (이메일/휴대폰)
import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, ViewStyle } from 'react-native';
import FormCard from './FormCard';

type Props = {
  title: string;
  desc?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  submitLabel: string;
  onSubmit: () => void;
  keyboardType?: KeyboardTypeOptions;
  style?: ViewStyle;
};

export default function IdentityForm({
  title,
  desc,
  value,
  onChangeText,
  placeholder,
  submitLabel,
  onSubmit,
  keyboardType = 'email-address',
  style,
}: Props) {
  return (
    <FormCard title={title} desc={desc} style={style}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="none"
        keyboardType={keyboardType}
        style={s.input}
      />
      <TouchableOpacity style={s.primaryBtn} onPress={onSubmit} activeOpacity={0.85}>
        <Text style={s.primaryText}>{submitLabel}</Text>
      </TouchableOpacity>
    </FormCard>
  );
}

const s = StyleSheet.create({
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
