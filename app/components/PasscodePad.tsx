import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AppState,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

type Props = {
    title: string; // 상단 문구 (ex. “PIN 번호 6자리를 입력해주세요”)
    subtitle?: string; // 보조 문구 (선택)
    pinLength?: number; // 기본 6
    randomize?: boolean; // 숫자 섞기 (기본 true)
    fakePress?: boolean; // 가짜 눌림 이펙트 (기본 true)
    onComplete: (pin: string) => void | Promise<void>; // 입력 완료 콜백
    style?: object; // 컨테이너 커스텀 스타일
};

export default function PasscodePad({
    title,
    subtitle,
    pinLength = 6,
    randomize = true,
    fakePress = true,
    onComplete,
    style,
}: Props) {
    const [pin, setPin] = useState("");
    const [digits, setDigits] = useState<number[]>([]);
    const [pressedKeys, setPressedKeys] = useState<number[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const {t} = useTranslation('auth');

    // 숫자 배열 준비
    useEffect(() => {
        const nums = [...Array(10).keys()];
        if (randomize) {
            for (let i = nums.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nums[i], nums[j]] = [nums[j], nums[i]];
            }
        }
        setDigits(nums);
    }, [randomize]);

    // 백그라운드 전환 시 초기화
    useEffect(() => {
        const sub = AppState.addEventListener("change", (s) => {
            if (s !== "active") reset();
        });
        return () => sub.remove();
    }, []);

    // 완료 처리
    useEffect(() => {
        if (pin.length === pinLength) {
            // 외부에서 처리 (서버 검증/생체 인증 등)
            Promise.resolve(onComplete(pin)).finally(() => {
                reset(); // 항상 초기화
            });
        }
    }, [pin, pinLength, onComplete]);

    const reset = () => {
        setPin("");
        setPressedKeys([]);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleDigitPress = (digit: number) => {
        if (pin.length >= pinLength) return;
        Haptics.selectionAsync().catch(() => { });
        let flashes = [digit];
        if (fakePress) {
            const fakes = digits
                .filter((d) => d !== digit)
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);
            flashes = [digit, ...fakes];
        }
        setPressedKeys(flashes);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setPressedKeys([]), 150);
        setPin((prev) => prev + String(digit));
    };

    const handleBackspace = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    const firstNine = useMemo(() => digits.slice(0, 9), [digits]);
    const lastDigit = digits[9];

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

            {/* PIN 도트 */}
            <View style={styles.pinRow}>
                {Array.from({ length: pinLength }).map((_, i) => (
                    <View
                        key={i}
                        style={[styles.pinBox, pin.length === i && styles.activePinBox]}
                    >
                        <Text style={styles.pinText}>{pin[i] ? "●" : ""}</Text>
                    </View>
                ))}
            </View>

            {/* 키패드 */}
            <View style={styles.keypad}>
                {firstNine.map((d) => (
                    <TouchableOpacity
                        key={d}
                        style={[styles.key, pressedKeys.includes(d) && styles.keyPressed]}
                        activeOpacity={1}
                        onPress={() => handleDigitPress(d)}
                    >
                        <View style={styles.keyContent}>
                            <Text style={styles.keyText}>{d}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.key, styles.clear]} onPress={reset}>
                    <View style={styles.keyContent}>
                        <Text style={[styles.keyText, { fontSize: 16 }]}>{t('clear')}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    key={lastDigit}
                    style={[
                        styles.key,
                        pressedKeys.includes(lastDigit) && styles.keyPressed,
                    ]}
                    activeOpacity={1}
                    onPress={() => handleDigitPress(lastDigit)}
                >
                    <View style={styles.keyContent}>
                        <Text style={styles.keyText}>{lastDigit}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.key, styles.backspace]}
                    onPress={handleBackspace}
                >
                    <View style={styles.keyContent}>
                        <Text style={[styles.keyText, { fontSize: 20 }]}>⌫</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", paddingTop: 24, paddingBottom: 40 },
    title: { fontSize: 18, color: "#1e293b", marginBottom: 8, fontWeight: "600" },
    subtitle: { fontSize: 13, color: "#64748b", marginBottom: 16 },
    pinRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
        gap: 14,
    },
    pinBox: {
        width: 40,
        height: 50,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#e2e8f0",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    activePinBox: { borderColor: "#3b82f6", backgroundColor: "#e0f2fe" },
    pinText: { fontSize: 26, color: "#0f172a", fontWeight: "700" },
    keypad: {
        width: width * 0.85,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 16,
    },
    key: {
        width: "30%",
        height: 60,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    keyPressed: { backgroundColor: "#bfdbfe", transform: [{ scale: 0.96 }] },
    keyContent: { flex: 1, justifyContent: "center", alignItems: "center" },
    keyText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
    },
    backspace: { backgroundColor: "#fee2e2" },
    clear: { backgroundColor: "#e2e8f0" },
});
