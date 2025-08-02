import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface FooterProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'explore', label: '탐색', icon: '🔎' },
  { key: 'profile', label: '프로필', icon: '👤' },
];

export default function Footer({ activeTab = 'home', onTabChange }: FooterProps) {
  return (
    <View style={styles.footer}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabChange && onTabChange(tab.key)}
        >
          <Text style={[styles.icon, activeTab === tab.key && styles.active]}>{tab.icon}</Text>
          <Text style={[styles.label, activeTab === tab.key && styles.active]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#888',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  active: {
    color: '#222',
    fontWeight: 'bold',
  },
});
