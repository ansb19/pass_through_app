// components/Footer.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Href, router, usePathname } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'home' | 'share' | 'qr' | 'vault' | 'profile';

const TAB_ROUTES = {
  home: '/home',
  share: '/share',
  qr: '/qr',
  vault: '/vault', // ✅ 개인정보 탭 경로
  profile: '/profile',
} as const satisfies Record<TabKey, Href>;

const TABS = [
  { key: 'home', labelKey: 'home', icon: (f: boolean) => <Ionicons name={f ? 'home' : 'home-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
  { key: 'share', labelKey: 'share', icon: (f: boolean) => <Ionicons name={f ? 'people' : 'people-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
  { key: 'qr', labelKey: 'qr', icon: (f: boolean) => <MaterialCommunityIcons name="qrcode-scan" size={24} color={f ? '#0050b8' : '#888'} /> },
  // ✅ 개인정보 탭 (보관함 아이콘)
  { key: 'vault', labelKey: 'personal_info', icon: (f: boolean) => <Ionicons name={f ? 'lock-closed' : 'lock-closed-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
  { key: 'profile', labelKey: 'profile', icon: (f: boolean) => <Ionicons name={f ? 'person' : 'person-outline'} size={24} color={f ? '#0050b8' : '#888'} /> },
] as const;

export default function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const s1 = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const s2 = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { s1.remove(); s2.remove(); };
  }, []);

  const activeKey = (Object.keys(TAB_ROUTES) as TabKey[])
    .find(k => pathname?.startsWith(TAB_ROUTES[k]));

  if (keyboardVisible) return null;

  const handlePress = (key: TabKey) => {
    // 현재 탭이면 아무 것도 하지 않음
    if (activeKey === key) return;

    const target = TAB_ROUTES[key];
    // 동일 경로 가드 (정밀 비교)
    if (pathname === target) return;

    // QR 탭 진동
    if (key === 'qr') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // 탭은 replace로 스택 누적 방지
    router.push(target);
  };

  return (
    <View style={[styles.footer, { paddingBottom: 0 /* or insets.bottom */ }]}>
      {TABS.map(tab => {
        const focused = activeKey === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [styles.tab, pressed && !focused && styles.pressed]}
            onPress={() => handlePress(tab.key)}
            // 액티브 탭은 눌림/리플/포커스 효과 비활성화
            disabled={focused}
            android_ripple={focused ? undefined : { color: 'rgba(0,0,0,0.06)', borderless: true }}
            accessibilityRole="button"
            accessibilityLabel={t(tab.labelKey)}
            accessibilityState={{ selected: focused }}
            hitSlop={10}
          >
            <View style={styles.iconWrap}>
              {tab.icon(focused)}
            </View>
            <Text style={[styles.label, focused && styles.activeLabel]}>
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    minHeight: 64,
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
    paddingTop: 6,
  },
  label: { fontSize: 11, color: '#888', marginTop: 3 },
  activeLabel: { color: '#0050b8', fontWeight: '600' },

  // ✅ QR 강조 제거(원래대로)
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  // iconFocused: {
  //   backgroundColor: 'rgba(0,80,184,0.08)',
  //   borderRadius: 16,
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  // },
  pressed: { opacity: 0.8 },
});
