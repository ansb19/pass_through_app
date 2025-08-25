// src/_components/TabChips.tsx
// 개인정보 조회 및 추가 상단 탭
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export type TabKey = string;
export type IconToken = keyof typeof Ionicons.glyphMap | 'mdi:id';

export interface TabItem {
    key: TabKey;
    label: string;
    icon: IconToken; // 'mdi:id'이면 MDI 사용
}

interface Props {
    items: TabItem[];
    value: TabKey;
    onChange: (key: TabKey) => void;
    size?: number; // 아이콘 사이즈 (기본 18)
}

export default function TabChips({ items, value, onChange, size = 18 }: Props) {
    const renderIcon = (icon: IconToken, active: boolean) => {
        const color = active ? '#fff' : '#374151';
        if (icon === 'mdi:id') {
            return <MaterialCommunityIcons name="card-account-details-outline" size={size} color={color} />;
        }
        return <Ionicons name={icon as any} size={size} color={color} />;
    };

    return (
        <View style={s.anchor}>
            <FlatList
                horizontal
                data={items}
                keyExtractor={(it) => it.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.content}
                ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                renderItem={({ item }) => {
                    const active = value === item.key;
                    return (
                        <Pressable
                            onPress={() => onChange(item.key)}
                            style={[s.chip, active && s.chipActive]}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <View style={s.inner}>
                                {renderIcon(item.icon, active)}
                                <Text style={[s.text, active && s.textActive]} numberOfLines={1}>
                                    {item.label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}

const s = StyleSheet.create({
    anchor: {
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    content: { paddingHorizontal: 12, alignItems: 'center' },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
    },
    chipActive: { backgroundColor: '#2563eb' },
    inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    text: { color: '#333', fontSize: 13, fontWeight: '600' },
    textActive: { color: '#fff' },
});
