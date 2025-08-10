// components/forms/ProfileForm.tsx
import {
    isBirthValid, isEmailValid, isNicknameValid, isPhoneValid,
    sanitizeDigits, sanitizeNickname
} from '@/src/utils/validation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export type ProfileFormValues = {
    nickname: string;
    birthDate: string; // YYYYMMDD
    email: string;
    phone: string;     // 숫자만
};

type FieldFlags = {
    nickname?: boolean;
    birthDate?: boolean;
    email?: boolean;
    phone?: boolean;
};

type Props = {
    mode?: 'signup' | 'edit';
    initial?: Partial<ProfileFormValues>;
    /** 어떤 필드를 보여줄지 선택(기본 전부 true) */
    fields?: FieldFlags;
    /** 인증 버튼 노출 여부 */
    showVerifyButtons?: boolean;
    style?: ViewStyle;
    onVerifyEmail?: (email: string) => void;
    onVerifyPhone?: (phone: string) => void;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    lockVerifiedFields?: boolean;        // 인증 완료면 잠금 (기본 false)
    autoInvalidateOnEdit?: boolean;      // 수정 시 자동 인증 무효화 (기본 true)
    onInvalidateEmail?: () => void;
    onInvalidatePhone?: () => void;
    submitLabel?: string;
    /** 제출 콜백 */
    onSubmit: (
        values: ProfileFormValues,
        meta: { nicknameValid: boolean; birthValid: boolean; emailValid: boolean; phoneValid: boolean }
    ) => void;
    /** 입력 바뀔 때 상위로 알림(옵션) */
    onChange?: (
        values: ProfileFormValues,
        meta: { nicknameValid: boolean; birthValid: boolean; emailValid: boolean; phoneValid: boolean; allValid: boolean }
    ) => void;
};

export default function ProfileForm({
    mode = 'signup',
    initial = {},
    fields,
    showVerifyButtons = true,
    style,
    onVerifyEmail,
    onVerifyPhone,
    submitLabel = mode === 'signup' ? '다음' : '저장',
    emailVerified = false,
    phoneVerified = false,
    lockVerifiedFields = false,
    autoInvalidateOnEdit = true,
    onInvalidateEmail,
    onInvalidatePhone,
    onSubmit,
    onChange,
}: Props) {
    const show = {
        nickname: fields?.nickname ?? true,
        birthDate: fields?.birthDate ?? true,
        email: fields?.email ?? true,
        phone: fields?.phone ?? true,
    };

    const [nickname, setNickname] = useState(initial.nickname ?? '');
    const [birthDate, setBirthDate] = useState(initial.birthDate ?? '');
    const [email, setEmail] = useState(initial.email ?? '');
    const [phone, setPhone] = useState(initial.phone ?? '');

    // 컴포넌트 상단에 추가
    const [emailEverVerified, setEmailEverVerified] = useState(emailVerified);
    const [phoneEverVerified, setPhoneEverVerified] = useState(phoneVerified);

    // 이메일 변경 핸들러
    const handleEmailChange = (v: string) => {
        // 잠금 모드면 타이핑 자체를 막음 (editable=false라 호출 안 됨)
        // 자동 무효화가 켜져 있으면, 인증 완료 상태에서 수정 시 인증 해제
        if (emailVerified && autoInvalidateOnEdit) onInvalidateEmail?.();
        setEmail(v);
    };

    // 휴대폰 변경 핸들러
    const handlePhoneChange = (v: string) => {
        const sanitized = sanitizeDigits(v, 11);
        if (phoneVerified && autoInvalidateOnEdit) onInvalidatePhone?.();
        setPhone(sanitized);
    };

    // initial 변경되면 동기화 (수정 화면에서 서버 재로딩 시 유용)
    useEffect(() => {
        if (initial.nickname !== undefined) setNickname(initial.nickname);
        if (initial.birthDate !== undefined) setBirthDate(initial.birthDate);
        if (initial.email !== undefined) setEmail(initial.email);
        if (initial.phone !== undefined) setPhone(initial.phone);
    }, [initial.nickname, initial.birthDate, initial.email, initial.phone]);

    useEffect(() => { if (emailVerified) setEmailEverVerified(true); }, [emailVerified]);
    useEffect(() => { if (phoneVerified) setPhoneEverVerified(true); }, [phoneVerified]);

    // 유효성
    const nicknameValid = useMemo(() => (!show.nickname ? true : isNicknameValid(nickname)), [show.nickname, nickname]);
    const birthValid = useMemo(() => (!show.birthDate ? true : isBirthValid(birthDate)), [show.birthDate, birthDate]);
    const emailValid = useMemo(() => (!show.email ? true : (!!email && isEmailValid(email))), [show.email, email]);
    const phoneValid = useMemo(() => (!show.phone ? true : (!!phone && isPhoneValid(phone))), [show.phone, phone]);

    const baseValid = nicknameValid && birthValid && emailValid && phoneValid;
    const allValid = baseValid && (!showVerifyButtons || (emailVerified && phoneVerified));


    // 상위로 실시간 전달(옵션)
    useEffect(() => {
        if (!onChange) return;
        onChange(
            { nickname, birthDate, email, phone },
            { nicknameValid, birthValid, emailValid, phoneValid, allValid }
        );
    }, [nickname, birthDate, email, phone, nicknameValid, birthValid, emailValid, phoneValid, allValid, onChange]);

    const handleSubmit = () => {
        if (!allValid) return;
        onSubmit(
            { nickname, birthDate, email, phone },
            { nicknameValid, birthValid, emailValid, phoneValid }
        );
    };

    // 입력 포커스 제어
    const birthRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                extraScrollHeight={30}
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[s.container, style]}>
                    {/* 닉네임 */}
                    {show.nickname && (
                        <>
                            <Text style={s.label}>닉네임</Text>
                            <TextInput
                                style={[s.input, !nicknameValid && s.inputError]}
                                placeholder="닉네임을 입력하세요"
                                value={nickname}
                                onChangeText={(v) => setNickname(sanitizeNickname(v))}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType={show.birthDate ? 'next' : show.email ? 'next' : show.phone ? 'next' : 'done'}
                                onSubmitEditing={() => {
                                    if (show.birthDate) birthRef.current?.focus();
                                    else if (show.email) emailRef.current?.focus();
                                    else if (show.phone) phoneRef.current?.focus();
                                }}
                                autoComplete="name"
                                textContentType="nickname"
                            />
                            {!nicknameValid && <Text style={s.error}>특수문자 제외, 1~20자 이내</Text>}
                        </>
                    )}

                    {/* 생년월일 */}
                    {show.birthDate && (
                        <>
                            <Text style={s.label}>생년월일</Text>
                            <TextInput
                                ref={birthRef}
                                style={[s.input, !birthValid && s.inputError]}
                                placeholder="ex) 19970710"
                                value={birthDate}
                                onChangeText={(v) => setBirthDate(sanitizeDigits(v, 8))}
                                keyboardType="number-pad"
                                maxLength={8}
                                returnKeyType={show.email ? 'next' : show.phone ? 'next' : 'done'}
                                onSubmitEditing={() => {
                                    if (show.email) emailRef.current?.focus();
                                    else if (show.phone) phoneRef.current?.focus();
                                }}
                                autoComplete="birthdate-full"
                                textContentType="none"
                            />
                            {!birthValid && birthDate.length > 0 && (
                                <Text style={s.error}>숫자 8자리(YYYYMMDD)여야 합니다.</Text>
                            )}
                        </>
                    )}

                    {/* 이메일 */}
                    {show.email && (
                        <>
                            <Text style={s.label}>이메일</Text>
                            <View style={s.row}>
                                <TextInput
                                    ref={emailRef}
                                    style={[
                                        s.input,
                                        { flex: 1 },
                                        email.length > 0 && !emailValid && s.inputError
                                    ]}
                                    placeholder="example@email.com"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={handleEmailChange}          // ✅ 변경
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType={show.phone ? 'next' : 'done'}
                                    onSubmitEditing={() => { if (show.phone) phoneRef.current?.focus(); }}
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    editable={!(emailVerified && lockVerifiedFields)}  // ✅ 인증완료+락이면 편집 불가
                                />

                                {showVerifyButtons && (
                                    emailVerified ? (
                                        <View style={s.verifiedWrap}>
                                            <View style={s.verifiedBadge}>
                                                <Text style={s.verifiedText}>인증완료</Text>
                                            </View>
                                            {lockVerifiedFields && (
                                                <TouchableOpacity onPress={onInvalidateEmail}>
                                                    <Text style={s.changeLink}>변경</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[s.button, !emailValid && { opacity: 0.5 }]}
                                            disabled={!emailValid}
                                            onPress={() => onVerifyEmail?.(email)}
                                        >
                                            <Text style={s.buttonText}>인증</Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                            {/* 재인증 안내 (자동 무효화 모드에서 유효한 이메일인데 미인증이면) */}
                            {(emailEverVerified && !emailVerified && showVerifyButtons) && (
                                <Text style={s.warn}>재인증이 필요합니다.</Text>
                            )}
                            {email.length > 0 && !emailValid && <Text style={s.error}>이메일 형식이 아닙니다.</Text>}
                        </>
                    )}

                    {/* 휴대폰 */}
                    {show.phone && (
                        <>
                            <Text style={s.label}>휴대폰</Text>
                            <View style={s.row}>
                                <TextInput
                                    ref={phoneRef}
                                    style={[
                                        s.input,
                                        { flex: 1 },
                                        phone.length > 0 && !phoneValid && s.inputError
                                    ]}
                                    placeholder="010xxxxxxxx"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={handlePhoneChange}                   // ✅ 변경
                                    maxLength={11}
                                    returnKeyType="done"
                                    autoComplete="tel"
                                    textContentType="telephoneNumber"
                                    editable={!(phoneVerified && lockVerifiedFields)} // ✅ 인증완료+락이면 편집 불가
                                />

                                {showVerifyButtons && (
                                    phoneVerified ? (
                                        <View style={s.verifiedWrap}>
                                            <View style={s.verifiedBadge}>
                                                <Text style={s.verifiedText}>인증완료</Text>
                                            </View>
                                            {lockVerifiedFields && (
                                                <TouchableOpacity onPress={onInvalidatePhone}>
                                                    <Text style={s.changeLink}>변경</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[s.button, !phoneValid && { opacity: 0.5 }]}
                                            disabled={!phoneValid}
                                            onPress={() => onVerifyPhone?.(phone)}
                                        >
                                            <Text style={s.buttonText}>인증</Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                            {(phoneEverVerified && !phoneVerified && showVerifyButtons) && (
                                <Text style={s.warn}>재인증이 필요합니다.</Text>
                            )}
                            {phone.length > 0 && !phoneValid && (
                                <Text style={s.error}>국내번호 형식이 아닙니다. (예: 010XXXXXXXX)</Text>
                            )}
                        </>
                    )}

                    {/* 제출 버튼 */}
                    <TouchableOpacity
                        style={[s.submit, !allValid && { opacity: 0.5 }]}
                        disabled={!allValid}
                        onPress={handleSubmit}
                    >
                        <Text style={s.submitText}>{submitLabel}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
}

const s = StyleSheet.create({
    container: { paddingTop: 4 },
    label: { fontSize: 15, color: '#374151', marginBottom: 6, marginTop: 16, fontWeight: '600' },
    input: {
        backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, lineHeight: 22, textAlignVertical: 'center',
    },
    inputError: { borderColor: '#ef4444' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    button: { backgroundColor: '#3b82f6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: '600' },
    error: { color: '#ef4444', fontSize: 12, marginTop: 6 },
    submit: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    verifiedBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    verifiedWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 }, // ✅ 배지+변경 링크 래퍼
    changeLink: { color: '#2563eb', fontWeight: '600' },                  // ✅ "변경"
    warn: { color: '#f59e0b', fontSize: 12, marginTop: 6 },               // ✅ 재인증 안내
});
