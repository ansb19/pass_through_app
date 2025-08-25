
import { isBirthValid, isEmailValid, isNicknameValid, isPhoneValid, sanitizeDigits, sanitizeNickname } from '@/src/core/utils/validation';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';


export type ProfileFormValues = { nickname: string; birthDate: string; email: string; phone: string; };

type Props = {
  mode?: 'signup' | 'edit';
  initial?: Partial<ProfileFormValues>;
  fields?: { nickname?: boolean; birthDate?: boolean; email?: boolean; phone?: boolean };
  showVerifyButtons?: boolean;
  style?: ViewStyle;
  // 🔽 새 콜백들 (인라인 OTP용)
  onSendEmailOtp?: (email: string) => Promise<{ ttl: number }>;
  onVerifyEmailOtp?: (email: string, code: string) => Promise<boolean>;
  onSendPhoneOtp?: (phone: string) => Promise<{ ttl: number }>;
  onVerifyPhoneOtp?: (phone: string, code: string) => Promise<boolean>;

  emailVerified?: boolean;
  phoneVerified?: boolean;
  lockVerifiedFields?: boolean;
  autoInvalidateOnEdit?: boolean;
  readOnlyFields?: { nickname?: boolean; birthDate?: boolean; email?: boolean; phone?: boolean };
  onInvalidateEmail?: () => void;
  onInvalidatePhone?: () => void;
  submitLabel?: string;
  onSubmit: (values: ProfileFormValues, meta: { nicknameValid: boolean; birthValid: boolean; emailValid: boolean; phoneValid: boolean }) => void;
  onChange?: (values: ProfileFormValues, meta: { nicknameValid: boolean; birthValid: boolean; emailValid: boolean; phoneValid: boolean; allValid: boolean }) => void;
};

export default function ProfileForm(props: Props) {
  const {
    mode = 'signup',
    initial = {},
    fields,
    showVerifyButtons = true,
    style,
    onSendEmailOtp,
    onVerifyEmailOtp,
    onSendPhoneOtp,
    onVerifyPhoneOtp,
    submitLabel,
    emailVerified = false,
    phoneVerified = false,
    lockVerifiedFields = false,
    autoInvalidateOnEdit = true,
    readOnlyFields,
    onInvalidateEmail,
    onInvalidatePhone,
    onSubmit,
    onChange,
  } = props;

  const { t } = useTranslation('profile_form');

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
  const lastSentRef = useRef<string>('');

  const [emailEverVerified, setEmailEverVerified] = useState(emailVerified);
  const [phoneEverVerified, setPhoneEverVerified] = useState(phoneVerified);

  // ✅ 인라인 OTP 상태
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailLeft, setEmailLeft] = useState(0);
  const emailTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneLeft, setPhoneLeft] = useState(0);
  const phoneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearEmailTimer = () => { if (emailTimerRef.current) clearInterval(emailTimerRef.current); emailTimerRef.current = null; };
  const clearPhoneTimer = () => { if (phoneTimerRef.current) clearInterval(phoneTimerRef.current); phoneTimerRef.current = null; };

  useEffect(() => { if (emailVerified) { setEmailEverVerified(true); setShowEmailOtp(false); clearEmailTimer(); } }, [emailVerified]);
  useEffect(() => { if (phoneVerified) { setPhoneEverVerified(true); setShowPhoneOtp(false); clearPhoneTimer(); } }, [phoneVerified]);

  useEffect(() => () => { clearEmailTimer(); clearPhoneTimer(); }, []);

  const startEmailTimer = useCallback((ttl: number) => {
    clearEmailTimer();
    setEmailLeft(ttl);
    emailTimerRef.current = setInterval(() => {
      setEmailLeft((p) => {
        if (p <= 1) { clearEmailTimer(); return 0; }
        return p - 1;
      });
    }, 1000);
  }, []);

  const startPhoneTimer = useCallback((ttl: number) => {
    clearPhoneTimer();
    setPhoneLeft(ttl);
    phoneTimerRef.current = setInterval(() => {
      setPhoneLeft((p) => {
        if (p <= 1) { clearPhoneTimer(); return 0; }
        return p - 1;
      });
    }, 1000);
  }, []);

  // 핸들러들 (변경 시 인증 무효화)
  const handleEmailChange = (v: string) => {
    if (emailVerified && autoInvalidateOnEdit) onInvalidateEmail?.();
    setEmail(v);
    // 입력 변경 시 OTP 입력창은 유지하되, 필요하면 코드를 비울 수 있음
  };
  const handlePhoneChange = (v: string) => {
    const sanitized = sanitizeDigits(v, 11);
    if (phoneVerified && autoInvalidateOnEdit) onInvalidatePhone?.();
    setPhone(sanitized);
  };

  // initial 동기화
  useEffect(() => {
    if (initial.nickname !== undefined) setNickname(initial.nickname);
    if (initial.birthDate !== undefined) setBirthDate(initial.birthDate);
    if (initial.email !== undefined) setEmail(initial.email);
    if (initial.phone !== undefined) setPhone(initial.phone);
  }, [initial.nickname, initial.birthDate, initial.email, initial.phone]);

  // 유효성
  const nicknameValid = useMemo(() => (!show.nickname ? true : isNicknameValid(nickname)), [show.nickname, nickname]);
  const birthValid    = useMemo(() => (!show.birthDate ? true : isBirthValid(birthDate)), [show.birthDate, birthDate]);
  const emailValid    = useMemo(() => (!show.email ? true : (!!email && isEmailValid(email))), [show.email, email]);
  const phoneValid    = useMemo(() => (!show.phone ? true : (!!phone && isPhoneValid(phone))), [show.phone, phone]);

  const baseValid = nicknameValid && birthValid && emailValid && phoneValid;
  const allValid  = baseValid && (!showVerifyButtons || (emailVerified && phoneVerified));

  // 상위로 변화 알림
  useEffect(() => {
    if (!onChange) return;
    const payload = JSON.stringify({ nickname, birthDate, email, phone, nicknameValid, birthValid, emailValid, phoneValid, allValid });
    if (payload === lastSentRef.current) return;
    lastSentRef.current = payload;
    onChange({ nickname, birthDate, email, phone }, { nicknameValid, birthValid, emailValid, phoneValid, allValid });
  }, [nickname, birthDate, email, phone, nicknameValid, birthValid, emailValid, phoneValid, allValid, onChange]);

  // 제출
  const handleSubmit = () => {
    if (!allValid) return;
    onSubmit({ nickname, birthDate, email, phone }, { nicknameValid, birthValid, emailValid, phoneValid });
  };

  // ===== 이메일 OTP 흐름 =====
  const handleClickEmailVerify = async () => {
    if (!onSendEmailOtp || !emailValid) return;
    try {
      const { ttl } = await onSendEmailOtp(email);
      setShowEmailOtp(true);
      setEmailCode('');
      startEmailTimer(ttl ?? 180);
    } catch (e) {
      // 상위에서 Alert 처리 가능. 여기서는 조용히 실패
    }
  };

  const handleConfirmEmailCode = async () => {
    if (!onVerifyEmailOtp || !showEmailOtp || emailLeft === 0) return;
    const ok = await onVerifyEmailOtp(email, emailCode);
    if (ok) { setShowEmailOtp(false); clearEmailTimer(); }
  };

  const handleResendEmailCode = async () => {
    if (!onSendEmailOtp || !emailValid) return;
    try {
      const { ttl } = await onSendEmailOtp(email);
      setEmailCode('');
      startEmailTimer(ttl ?? 180);
    } catch (e) {}
  };

  // ===== 휴대폰 OTP 흐름 =====
  const handleClickPhoneVerify = async () => {
    if (!onSendPhoneOtp || !phoneValid) return;
    try {
      const { ttl } = await onSendPhoneOtp(phone);
      setShowPhoneOtp(true);
      setPhoneCode('');
      startPhoneTimer(ttl ?? 180);
    } catch (e) {}
  };

  const handleConfirmPhoneCode = async () => {
    if (!onVerifyPhoneOtp || !showPhoneOtp || phoneLeft === 0) return;
    const ok = await onVerifyPhoneOtp(phone, phoneCode);
    if (ok) { setShowPhoneOtp(false); clearPhoneTimer(); }
  };

  const handleResendPhoneCode = async () => {
    if (!onSendPhoneOtp || !phoneValid) return;
    try {
      const { ttl } = await onSendPhoneOtp(phone);
      setPhoneCode('');
      startPhoneTimer(ttl ?? 180);
    } catch (e) {}
  };

  // 포커스 제어
  const birthRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const resolvedSubmitLabel = submitLabel ?? (mode === 'signup' ? t('btn_next') : t('btn_save'));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={30}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.container, style]}>
          {/* 닉네임 */}
          {show.nickname && (
            <>
              <Text style={s.label}>{t('label_nickname')}</Text>
              <TextInput
                style={[s.input, !nicknameValid && s.inputError]}
                placeholder={t('ph_nickname')}
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
              {!nicknameValid && <Text style={s.error}>{t('err_nickname')}</Text>}
            </>
          )}

          {/* 생년월일 */}
          {show.birthDate && (
            <>
              <Text style={s.label}>{t('label_birth')}</Text>
              <TextInput
                ref={birthRef}
                style={[ s.input, !birthValid && s.inputError, readOnlyFields?.birthDate && s.inputReadonly ]}
                placeholder={t('ph_birth')}
                value={birthDate}
                editable={!readOnlyFields?.birthDate}
                onChangeText={(v) => { if (!readOnlyFields?.birthDate) setBirthDate(sanitizeDigits(v, 8)); }}
                keyboardType="number-pad"
                maxLength={8}
                returnKeyType={show.email ? 'next' : show.phone ? 'next' : 'done'}
                onSubmitEditing={() => { if (show.email) emailRef.current?.focus(); else if (show.phone) phoneRef.current?.focus(); }}
                autoComplete="birthdate-full"
                textContentType="none"
              />
              {!birthValid && birthDate.length > 0 && <Text style={s.error}>{t('err_birth')}</Text>}
            </>
          )}

          {/* 이메일 */}
          {show.email && (
            <>
              <Text style={s.label}>{t('label_email')}</Text>
              <View style={s.row}>
                <TextInput
                  ref={emailRef}
                  style={[ s.input, { flex: 1 }, email.length > 0 && !emailValid && s.inputError ]}
                  placeholder={t('ph_email')}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType={show.phone ? 'next' : 'done'}
                  onSubmitEditing={() => { if (show.phone) phoneRef.current?.focus(); }}
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!(emailVerified && lockVerifiedFields)}
                />
                {showVerifyButtons && (
                  emailVerified ? (
                    <View style={s.verifiedWrap}>
                      <View style={s.verifiedBadge}><Text style={s.verifiedText}>{t('verified')}</Text></View>
                      {lockVerifiedFields && (
                        <TouchableOpacity onPress={onInvalidateEmail}>
                          <Text style={s.changeLink}>{t('btn_change')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[s.button, !emailValid && { opacity: 0.5 }]}
                      disabled={!emailValid}
                      onPress={handleClickEmailVerify}
                    >
                      <Text style={s.buttonText}>{t('btn_verify')}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              {email.length > 0 && !emailValid && <Text style={s.error}>{t('err_email')}</Text>}

              {/* ✅ 이메일 OTP 인라인 영역 */}
              {showVerifyButtons && !emailVerified && showEmailOtp && (
                <View style={s.otpBox}>
                  <TextInput
                    value={emailCode}
                    onChangeText={setEmailCode}
                    placeholder={t('ph_otp', { defaultValue: '인증코드 6자리' })}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[s.input, { flex: 1 }]}
                  />
                  <TouchableOpacity style={s.button} onPress={handleConfirmEmailCode} disabled={emailLeft === 0 || emailCode.length < 6}>
                    <Text style={s.buttonText}>{t('btn_confirm')}</Text>
                  </TouchableOpacity>
                  <View style={s.otpFooter}>
                    <Text style={s.timer}>{t('time_left', { defaultValue: '남은시간' })}: {emailLeft}s</Text>
                    <TouchableOpacity onPress={handleResendEmailCode} disabled={emailLeft > 0}>
                      <Text style={[s.resend, emailLeft > 0 && { opacity: 0.4 }]}>{t('btn_resend')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {/* 휴대폰 */}
          {show.phone && (
            <>
              <Text style={s.label}>{t('label_phone')}</Text>
              <View style={s.row}>
                <TextInput
                  ref={phoneRef}
                  style={[ s.input, { flex: 1 }, phone.length > 0 && !phoneValid && s.inputError ]}
                  placeholder={t('ph_phone')}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  maxLength={11}
                  returnKeyType="done"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  editable={!(phoneVerified && lockVerifiedFields)}
                />
                {showVerifyButtons && (
                  phoneVerified ? (
                    <View style={s.verifiedWrap}>
                      <View style={s.verifiedBadge}><Text style={s.verifiedText}>{t('verified')}</Text></View>
                      {lockVerifiedFields && (
                        <TouchableOpacity onPress={onInvalidatePhone}>
                          <Text style={s.changeLink}>{t('btn_change')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[s.button, !phoneValid && { opacity: 0.5 }]}
                      disabled={!phoneValid}
                      onPress={handleClickPhoneVerify}
                    >
                      <Text style={s.buttonText}>{t('btn_verify')}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              {phone.length > 0 && !phoneValid && <Text style={s.error}>{t('err_phone')}</Text>}

              {/* ✅ 휴대폰 OTP 인라인 영역 */}
              {showVerifyButtons && !phoneVerified && showPhoneOtp && (
                <View style={s.otpBox}>
                  <TextInput
                    value={phoneCode}
                    onChangeText={setPhoneCode}
                    placeholder={t('ph_otp', { defaultValue: '인증코드 6자리' })}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[s.input, { flex: 1 }]}
                  />
                  <TouchableOpacity style={s.button} onPress={handleConfirmPhoneCode} disabled={phoneLeft === 0 || phoneCode.length < 6}>
                    <Text style={s.buttonText}>{t('btn_confirm')}</Text>
                  </TouchableOpacity>
                  <View style={s.otpFooter}>
                    <Text style={s.timer}>{t('time_left', { defaultValue: '남은시간' })}: {phoneLeft}s</Text>
                    <TouchableOpacity onPress={handleResendPhoneCode} disabled={phoneLeft > 0}>
                      <Text style={[s.resend, phoneLeft > 0 && { opacity: 0.4 }]}>{t('btn_resend')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {/* 제출 */}
          <TouchableOpacity style={[s.submit, !allValid && { opacity: 0.5 }]} disabled={!allValid} onPress={handleSubmit}>
            <Text style={s.submitText}>{resolvedSubmitLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

// ===== styles (하단에 몇 개 추가)
const s = StyleSheet.create({
  container: { paddingTop: 4 },
  label: { fontSize: 15, color: '#374151', marginBottom: 6, marginTop: 16, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, lineHeight: 22, textAlignVertical: 'center' },
  inputError: { borderColor: '#ef4444' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  button: { backgroundColor: '#3b82f6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#ef4444', fontSize: 12, marginTop: 6 },
  submit: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  verifiedBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  verifiedText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  verifiedWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  changeLink: { color: '#2563eb', fontWeight: '600' },
  warn: { color: '#f59e0b', fontSize: 12, marginTop: 6 },
  inputReadonly: { backgroundColor: '#f9fafb', color: '#6b7280' },
  readonlyHint: { color: '#6b7280', fontSize: 12, marginTop: 6 },
  // 🔽 추가
  otpBox: { marginTop: 10, gap: 8 },
  otpFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: { color: '#6b7280', fontSize: 12 },
  resend: { color: '#2563eb', fontWeight: '600' },
});
