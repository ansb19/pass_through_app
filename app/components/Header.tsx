import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface HeaderProps {
  title?: string;
  onBackPress?: () => void;      // 있으면 뒤로가기 버튼 표시
  onSearchPress?: () => void;    // 있으면 검색 버튼 표시
  leftArea?: React.ReactNode;
  rightArea?: React.ReactNode;
}

export default function Header({
  title = '',
  onBackPress,
  onSearchPress,
  leftArea,
  rightArea,
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      {/* 왼쪽 래퍼 */}
      <View style={styles.side}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#222" />
          </TouchableOpacity>
        )}
        {leftArea}
      </View>

      {/* 중앙 타이틀 */}
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title || t('appName')}
      </Text>

      {/* 오른쪽 래퍼 */}
      <View style={[styles.side, { justifyContent: 'flex-end' }]}>
        {rightArea}
        {onSearchPress && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color="#222" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const SIDE_WIDTH = 120; // 좌/우 고정 폭(타이틀 중앙 유지)

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    paddingHorizontal: 8,
  },
  side: {
    width: SIDE_WIDTH, // 좌우 동일 폭 → 타이틀 항상 중앙
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1, // 남은 공간 중앙 채우기
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
});
