//OTP 인증 폼
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, ViewStyle } from 'react-native';
import FormCard from './FormCard';

type Props = {
    title: string;
    descPrefix: string;          // "이메일로 전송된 코드" 같은 문구
    maskedTarget: string;        // user@****.com / 010-***-** 형태
    otp: string;
    onChangeOtp: (v: string) => void;
    onVerify: () => void;
    verifyLabel: string;
    timeLeft: number;            // 초
    resendLabel: string;
    onResend: () => void;
    changeIdentityLabel: string;
    onChangeIdentity: () => void;
    style?: ViewStyle;
};

export default function OtpVerifyForm({
    title,
    descPrefix,
    maskedTarget,
    otp,
    onChangeOtp,
    onVerify,
    verifyLabel,
    timeLeft,
    resendLabel,
    onResend,
    changeIdentityLabel,
    onChangeIdentity,
    style,
}: Props) {
    return (
        <FormCard title={title} style={style} desc={`${descPrefix} ${maskedTarget}`}>
            <TextInput
                value={otp}
                onChangeText={onChangeOtp}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                style={s.input}
            />

            <TouchableOpacity style={s.primaryBtn} onPress={onVerify} activeOpacity={0.85}>
                <Text style={s.primaryText}>{verifyLabel}</Text>
            </TouchableOpacity>

            <Text style={s.timer}>남은시간: {timeLeft}s</Text>

            <TouchableOpacity
                style={[s.subtleBtn, { marginTop: 8 }]}
                onPress={onResend}
                disabled={timeLeft > 0}
                activeOpacity={0.7}
            >
                <Text style={[s.subtleText, timeLeft > 0 && { opacity: 0.4 }]}>{resendLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[s.subtleBtn, { marginTop: 8 }]}
                onPress={onChangeIdentity}
                activeOpacity={0.7}
            >
                <Text style={s.subtleText}>{changeIdentityLabel}</Text>
            </TouchableOpacity>
        </FormCard>
    );
}

const s = StyleSheet.create({
    input: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        fontSize: 15,
        color: '#111',
        backgroundColor: '#fafafa',
    },
    primaryBtn: {
        marginTop: 4,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#0b62ff',
        alignItems: 'center',
    },
    primaryText: { color: '#fff', fontWeight: '700' },
    subtleBtn: { alignItems: 'center' },
    subtleText: { color: '#6b7280', fontWeight: '600' },
    timer: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
