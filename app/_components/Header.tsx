import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
  onSearchPress?: () => void;
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

  // 좌/우 실제 폭 측정 → 타이틀 안전 여백 계산
  const [leftW, setLeftW] = React.useState(0);
  const [rightW, setRightW] = React.useState(0);
  const pad = Math.max(leftW, rightW); // 좌우 중 큰 값을 타이틀 여백으로

  return (
    <View style={styles.header}>
      {/* 왼쪽 래퍼 (실제 폭 측정) */}
      <View
        style={styles.sideLeft}
        onLayout={e => setLeftW(e.nativeEvent.layout.width)}
      >
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#222" />
          </TouchableOpacity>
        )}
        {leftArea}
      </View>

      {/* 중앙 타이틀: 절대 배치 + 동적 좌우 여백 + 자동 폰트 축소 */}
      <View
        style={[styles.titleContainer, { left: pad, right: pad }]}
        pointerEvents="none"
      >
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="clip"         // … 대신 잘라내기
          adjustsFontSizeToFit         // 한 줄 유지 위해 자동 축소
          minimumFontScale={0.85}      // 폰트 최소 축소 비율 (필요시 0.75~0.8)
        >
          {title || t('appName')}
        </Text>
      </View>

      {/* 오른쪽 래퍼 (실제 폭 측정) */}
      <View
        style={styles.sideRight}
        onLayout={e => setRightW(e.nativeEvent.layout.width)}
      >
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

const HEADER_HEIGHT = 56;

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
  },

  // 양쪽은 자연 폭(컨텐츠 만큼) + 수평 배치
  sideLeft: {
    position: 'absolute',
    left: 8,
    top: 0, bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    position: 'absolute',
    right: 8,
    top: 0, bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // 타이틀은 부모 기준 절대 배치 + 좌우 여백은 동적으로
  titleContainer: {
    position: 'absolute',
    top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    textAlign: 'center',
  },

  iconButton: {
    width: 44, height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
