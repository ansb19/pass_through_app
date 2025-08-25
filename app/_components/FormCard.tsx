import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
  title?: string;
  desc?: string;
  style?: ViewStyle;
}>;

export default function FormCard({ title, desc, style, children }: Props) {
  return (
    <View style={[s.card, style]}>
      {title ? <Text style={s.title}>{title}</Text> : null}
      {desc ? <Text style={s.desc}>{desc}</Text> : null}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowOpacity: 0.04,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  desc: { fontSize: 13, color: '#374151', lineHeight: 20 },
});
