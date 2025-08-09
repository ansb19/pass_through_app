import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface FooterProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { key: 'home',    labelKey: 'home',    icon: (f: boolean) => <Ionicons name={f ? 'home' : 'home-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
  { key: 'share',   labelKey: 'share',   icon: (f: boolean) => <Ionicons name={f ? 'people' : 'people-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
  { key: 'qr',      labelKey: 'qr',      icon: (f: boolean) => <MaterialCommunityIcons name="qrcode-scan" size={26} color={f ? '#0050b8' : '#888'} /> },
  { key: 'support', labelKey: 'support', icon: (f: boolean) => <FontAwesome5 name="headset" size={20} color={f ? '#0050b8' : '#888'} /> },
  { key: 'profile', labelKey: 'profile', icon: (f: boolean) => <Ionicons name={f ? 'person' : 'person-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
];

export default function Footer({ activeTab = 'home', onTabChange }: FooterProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.footer}>
      {tabs.map(tab => {
        const focused = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange && onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t(tab.labelKey)}
          >
            {tab.icon(focused)}
            <Text style={[styles.label, focused && styles.activeLabel]}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    height: 64,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
  },
  activeLabel: {
    color: '#0050b8',
    fontWeight: '600',
  },
});
