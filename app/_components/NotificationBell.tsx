// app/_components/NotificationBell.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  count?: number;                 // 안 읽은 개수 (뱃지)
  onPress?: (e: GestureResponderEvent) => void;
  size?: number;                  // 아이콘 크기
  color?: string;                 // 아이콘 색상
  accessibilityLabel?: string;   // 접근성 라벨
  style?: object;                 // 외부에서 감싸는 스타일
};

export default function NotificationBell({
  count = 0,
  onPress,
  size = 22,
  color = '#333',
  accessibilityLabel = '알림',
  style
}: Props) {
  const badgeText = count > 9 ? '9+' : String(count);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{ marginLeft: 12 }, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.8}
    >
      <View>
        <Ionicons name="notifications-outline" size={size} color={color} />
        {count > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0050b8',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700'
  }
});
