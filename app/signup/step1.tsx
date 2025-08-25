// app/signup/step1.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AppLayout from '../_components/AppLayout';

export default function SignupStepOneScreen() {
    const { t } = useTranslation(['policies', 'auth', 'common']);
    const [scrolledTerms, setScrolledTerms] = useState(false);
    const [scrolledPrivacy, setScrolledPrivacy] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);

    const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);

    const allAgreed = agreeTerms && agreePrivacy;

    const onScrollEnd = (
        e: NativeSyntheticEvent<NativeScrollEvent>,
        setter: (v: boolean) => void
    ) => {
        const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
        const reachedEnd =
            contentOffset.y + layoutMeasurement.height >= contentSize.height - 8;
        if (reachedEnd) setter(true);
    };

    const handleNext = () => {
        if (!allAgreed) return;
        router.push('/signup/step2');
    };

    return (
        <AppLayout
            showFooter={false}
            headerProps={{
                title: t('auth:agreements', '약관 동의'),
                onBackPress: () => router.back(),
            }}
        >
            <ScrollView
                contentContainerStyle={s.container}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={outerScrollEnabled}
                nestedScrollEnabled
            >
                <View style={s.notice}>
                    <Ionicons name="alert-circle-outline" size={18} color="#555" />
                    <Text style={s.noticeText}>
                        {t('policies:scroll_notice', '아래 문서를 끝까지 스크롤하면 동의 체크가 가능해요.')}
                    </Text>
                </View>

                <DocCard
                    title={t('policies:use_title', '이용약관')}
                    content={t('policies:use_content', '본 문서는 참고용 초안입니다.')}
                    scrolled={scrolledTerms}
                    onScrollEnd={(e) => onScrollEnd(e, setScrolledTerms)}
                    setOuterScrollEnabled={setOuterScrollEnabled}
                    footerHint={t('policies:scroll_hint_footer', '끝까지 스크롤해주세요')}
                />
                <AgreeRow
                    label={t('auth:agree_terms', '이용약관에 동의 (필수)')}
                    enabled={scrolledTerms}
                    checked={agreeTerms}
                    onToggle={() => setAgreeTerms((v) => !v)}
                    disabledHint={t('policies:scroll_hint_row', '문서를 끝까지 읽어주세요')}
                />

                <DocCard
                    title={t('policies:privacy_title', '개인정보처리방침')}
                    content={t('policies:privacy_content', '본 문서는 참고용 초안입니다.')}
                    scrolled={scrolledPrivacy}
                    onScrollEnd={(e) => onScrollEnd(e, setScrolledPrivacy)}
                    setOuterScrollEnabled={setOuterScrollEnabled}
                    footerHint={t('policies:scroll_hint_footer', '끝까지 스크롤해주세요')}
                />
                <AgreeRow
                    label={t('auth:agree_privacy', '개인정보처리방침에 동의 (필수)')}
                    enabled={scrolledPrivacy}
                    checked={agreePrivacy}
                    onToggle={() => setAgreePrivacy((v) => !v)}
                    disabledHint={t('policies:scroll_hint_row', '문서를 끝까지 읽어주세요')}
                />

                <Pressable
                    style={[s.submitBtn, !allAgreed && s.submitBtnDisabled]}
                    onPress={handleNext}
                    disabled={!allAgreed}
                >
                    <Text style={s.submitText}>
                        {t('common:agree_and_continue', '동의합니다')}
                    </Text>
                </Pressable>
            </ScrollView>
        </AppLayout>
    );
}

function DocCard({
    title,
    content,
    scrolled,
    onScrollEnd,
    setOuterScrollEnabled,
    footerHint,
}: {
    title: string;
    content: string;
    scrolled: boolean;
    onScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    setOuterScrollEnabled: (v: boolean) => void;
    footerHint: string;
}) {
    return (
        <View style={s.card}>
            <Text style={s.cardTitle}>{title}</Text>
            <View style={s.docBox}>
                <ScrollView
                    style={{ flex: 1 }}
                    nestedScrollEnabled
                    onScroll={onScrollEnd}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator
                    onTouchStart={() => setOuterScrollEnabled(false)}
                    onTouchEnd={() => setOuterScrollEnabled(true)}
                    onScrollEndDrag={() => setOuterScrollEnabled(true)}
                    onMomentumScrollEnd={() => setOuterScrollEnabled(true)}
                    contentContainerStyle={{ paddingRight: 8 }}
                >
                    <Text style={s.docText}>{content}</Text>
                    <View style={{ height: 8 }} />
                </ScrollView>

                {!scrolled && (
                    <View style={s.overlay} pointerEvents="none">
                        <Ionicons name="chevron-down" size={18} color="#333" />
                        <Text style={s.overlayText}>{footerHint}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

function AgreeRow({
    label,
    enabled,
    checked,
    onToggle,
    disabledHint,
}: {
    label: string;
    enabled: boolean;
    checked: boolean;
    onToggle: () => void;
    disabledHint: string;
}) {
    return (
        <Pressable
            style={s.agreeRow}
            onPress={() => enabled && onToggle()}
            disabled={!enabled}
        >
            <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={22}
                color={enabled ? (checked ? '#0050b8' : '#888') : '#ccc'}
            />
            <Text style={[s.agreeLabel, !enabled && { color: '#aaa' }]}>{label}</Text>
            {!enabled && <Text style={s.hint}>{disabledHint}</Text>}
        </Pressable>
    );
}

const s = StyleSheet.create({
    container: { padding: 16, gap: 14 },
    notice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f1f5ff',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    noticeText: { color: '#2b4ea1', fontSize: 12, lineHeight: 18 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        gap: 10,
        elevation: 1,
        shadowOpacity: 0.04,
    },
    cardTitle: { fontSize: 15, fontWeight: '700' },
    docBox: {
        position: 'relative',
        height: 240,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        overflow: 'hidden',
    },
    docText: { fontSize: 13, lineHeight: 20, color: '#333' },

    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#eee',
    },
    overlayText: { fontSize: 12, color: '#333' },

    agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6 },
    agreeLabel: { fontSize: 13, color: '#333', flexShrink: 1 },
    hint: { marginLeft: 'auto', fontSize: 11, color: '#999' },

    submitBtn: {
        marginTop: 8,
        backgroundColor: '#0050b8',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    submitBtnDisabled: { backgroundColor: '#9db8e1' },
    submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
