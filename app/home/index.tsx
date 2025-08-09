import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../components/AppLayout';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation('home');

  const menus = [
    { key: 'view_personal', icon: <Ionicons name="document-text-outline" size={28} color="#0050b8" /> },
    { key: 'add_personal', icon: <Ionicons name="add-circle-outline" size={28} color="#0050b8" /> },
    { key: 'share_history', icon: <MaterialCommunityIcons name="share-outline" size={28} color="#0050b8" /> },
    { key: 'received_share', icon: <MaterialCommunityIcons name="inbox-arrow-down-outline" size={28} color="#0050b8" /> },
    { key: 'recent_history', icon: <Ionicons name="time-outline" size={28} color="#0050b8" /> },
    { key: 'qr_scan', icon: <MaterialCommunityIcons name="qrcode-scan" size={28} color="#0050b8" /> },
    { key: 'faq', icon: <Ionicons name="help-circle-outline" size={28} color="#0050b8" /> },
    { key: 'contact', icon: <FontAwesome5 name="headset" size={26} color="#0050b8" /> },
    { key: 'find_friend', icon: <Ionicons name="search-outline" size={28} color="#0050b8" /> },
    { key: 'add_friend', icon: <Ionicons name="person-add-outline" size={28} color="#0050b8" /> },
    { key: 'my_info', icon: <Ionicons name="person-outline" size={28} color="#0050b8" /> },
  ];

  const handlePress = (key: string) => {
    console.log(`${key} 클릭됨`);
    // 예: if (key === 'qr_scan') navigation.push('/qr');
  };

  return (
    <AppLayout
      showHeader={true}
      showFooter={true}
      headerProps={{
        title: t('home', { ns: 'common' }),
        showBack: false,
      }}
      footerProps={{
        activeTab: 'home',
        onTabChange: (tab) => {
          console.log(`탭 변경: ${tab}`);
        }
      }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {menus.map((menu) => (
          <TouchableOpacity
            key={menu.key}
            style={styles.menuCard}
            onPress={() => handlePress(menu.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>{menu.icon}</View>
            <Text style={styles.menuLabel}>{t(menu.key)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AppLayout>
  );
}

const CARD_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
    backgroundColor: '#f9fafc',
  },
  menuCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.7,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
