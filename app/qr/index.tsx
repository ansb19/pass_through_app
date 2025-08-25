import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Easing, LayoutChangeEvent, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../_components/AppLayout';

export default function QRScreen() {
    const router = useRouter();
    const { t } = useTranslation(['qr', 'common']);
    const [permission, requestPermission] = useCameraPermissions();
    const [torchOn, setTorchOn] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const lastScanAtRef = useRef<number>(0);

    // 레이아웃 측정
    const FOCUS_SIZE = 260;
    const [viewport, setViewport] = useState({ w: 0, h: 0 });
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setViewport({ w: width, h: height });
    }, []);

    const focusRect = useMemo(() => {
        const { w, h } = viewport;
        const size = Math.min(FOCUS_SIZE, w - 32, h - 180); // 너무 큰 경우 안전 축소
        const left = (w - size) / 2;
        const top = (h - size) / 2;
        return { size, top, left, right: left + size, bottom: top + size };
    }, [viewport]);

    const needPermission = !permission || !permission.granted;

    const handleAskPermission = useCallback(async () => {
        const { granted, canAskAgain } = await requestPermission();
        if (!granted && !canAskAgain) {
            Alert.alert(
                t('qr:permission_alert_title'),
                t('qr:permission_alert_desc'),
                [
                    { text: t('common:cancel'), style: 'cancel' as const },
                    { text: t('qr:open_settings'), onPress: () => Linking.openSettings() }
                ]
            );
        }
    }, [requestPermission, t]);

    const toggleTorch = useCallback(() => setTorchOn(v => !v), []);
    const throttleMs = 1200;

    const onBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
        if (!isActive) return;
        const now = Date.now();
        if (now - lastScanAtRef.current < throttleMs) return;
        lastScanAtRef.current = now;
        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { }
        setIsActive(false);

        const token = (data || '').trim();
        if (!token) {
            Alert.alert(t('qr:scan_failed_title'), t('qr:scan_failed_desc'));
            setIsActive(true);
            return;
        }
        router.replace({ pathname: '/share/view', params: { token } });
    }, [isActive, router, t]);

    // 스캔 라인 애니메이션
    const scanAnim = useRef(new Animated.Value(0)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        if (isActive) {
            const seq = Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ]);
            const loop = Animated.loop(seq);
            loopRef.current = loop;
            loop.start();
        } else {
            if (loopRef.current) {
                loopRef.current.stop();
                loopRef.current = null;
            }
        }
        return () => {
            if (loopRef.current) {
                loopRef.current.stop();
                loopRef.current = null;
            }
        };
    }, [isActive, scanAnim]);

    const translateY = focusRect.size
        ? scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, focusRect.size - 3] })
        : 0;

    return (
        <AppLayout showFooter={false} headerProps={{ title: t('qr:title'), onBackPress: () => router.back() }}>
            {needPermission ? (
                <View style={s.centerWrap}>
                    <Text style={s.title}>{t('qr:camera_permission_needed_title')}</Text>
                    <Text style={s.subtitle}>{t('qr:camera_permission_needed_desc')}</Text>
                    <TouchableOpacity style={s.primaryBtn} onPress={handleAskPermission}>
                        <Text style={s.primaryBtnText}>{t('qr:request_permission')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={s.scannerWrap} onLayout={onLayout}>
                    <CameraView
                        style={StyleSheet.absoluteFill}
                        facing="back"
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                        onBarcodeScanned={onBarcodeScanned}
                        enableTorch={torchOn}
                        active={isActive}
                    />

                    {/* 절대 위치 4면 마스크 — 빈 틈 0% */}
                    {focusRect.size > 0 && (
                        <>
                            {/* Top mask */}
                            <View style={[s.mask, { top: 0, left: 0, right: 0, height: focusRect.top }]} />
                            {/* Bottom mask */}
                            <View style={[s.mask, { bottom: 0, left: 0, right: 0, height: viewport.h - focusRect.bottom }]} />
                            {/* Left mask */}
                            <View style={[s.mask, { top: focusRect.top, bottom: viewport.h - focusRect.bottom, left: 0, width: focusRect.left }]} />
                            {/* Right mask */}
                            <View style={[s.mask, { top: focusRect.top, bottom: viewport.h - focusRect.bottom, right: 0, width: viewport.w - focusRect.right }]} />

                            {/* 포커스 박스 + 장식 + 스캔라인 */}
                            <View
                                pointerEvents="none"
                                style={[
                                    s.focus,
                                    { position: 'absolute', top: focusRect.top, left: focusRect.left, width: focusRect.size, height: focusRect.size }
                                ]}
                            >
                                <View style={[s.corner, s.cTL]} />
                                <View style={[s.corner, s.cTR]} />
                                <View style={[s.corner, s.cBL]} />
                                <View style={[s.corner, s.cBR]} />
                                <Animated.View style={[s.scanLine, { transform: [{ translateY }] }]} />
                            </View>
                        </>
                    )}

                    {/* 상단 힌트 + 상태 */}
                    <View pointerEvents="none" style={s.topHint}>
                        <Text style={s.hintText}>{t('qr:scan_hint')}</Text>
                        <View style={[s.statusPill, isActive ? s.pillActive : s.pillPaused]}>
                            <Text style={s.pillText}>{isActive ? t('qr:status_scanning') : t('qr:status_paused')}</Text>
                        </View>
                    </View>

                    {/* 하단 컨트롤 */}
                    <View style={s.bottomBar}>
                        <TouchableOpacity
                            style={[s.controlBtn, !isActive && s.btnSecondary]}
                            onPress={() => setIsActive(v => !v)}
                        >
                            <Text style={s.controlText}>{isActive ? t('qr:pause') : t('qr:resume')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.controlBtn} onPress={toggleTorch}>
                            <Text style={s.controlText}>{torchOn ? t('qr:torch_off') : t('qr:torch_on')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </AppLayout>
    );
}

const s = StyleSheet.create({
    scannerWrap: { flex: 1, backgroundColor: '#000' },

    // 절대 마스크
    mask: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.45)' },

    // 포커스 박스
    focus: { borderWidth: 2, borderColor: '#4da3ff', borderRadius: 16, overflow: 'hidden' },

    // 코너
    corner: { position: 'absolute', width: 24, height: 24, borderColor: '#4da3ff' },
    cTL: { top: 0, left: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 14 },
    cTR: { top: 0, right: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 14 },
    cBL: { bottom: 0, left: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 14 },
    cBR: { bottom: 0, right: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 14 },

    // 스캔 라인
    scanLine: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: '#4da3ff', opacity: 0.9 },

    // 상단 힌트
    topHint: { position: 'absolute', top: 16, left: 16, right: 16, alignItems: 'center' },
    hintText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
    statusPill: { marginTop: 8, paddingHorizontal: 10, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    pillActive: { backgroundColor: 'rgba(37,99,235,0.6)' },
    pillPaused: { backgroundColor: 'rgba(156,163,175,0.6)' },
    pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    // 하단 컨트롤
    bottomBar: { position: 'absolute', left: 16, right: 16, bottom: 24, flexDirection: 'row', gap: 12 },
    controlBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    btnSecondary: { backgroundColor: 'rgba(77,163,255,0.25)', borderColor: '#4da3ff' },
    controlText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // 권한 화면
    centerWrap: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', gap: 16 },
    title: { color: '#fff', fontSize: 20, fontWeight: '700' },
    subtitle: { color: '#bbb', fontSize: 14, textAlign: 'center' },
    primaryBtn: { marginTop: 8, paddingHorizontal: 18, height: 44, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
