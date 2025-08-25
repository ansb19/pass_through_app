// app/help/add.tsx
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AppLayout from '../_components/AppLayout';

type Category = 'general' | 'account' | 'security' | 'share';

// 키만 정의하고, 라벨은 i18n으로 렌더링 시점에 가져온다
const CATEGORY_KEYS: Category[] = ['general', 'account', 'security', 'share'];

export default function HelpAddScreen() {
  const { t } = useTranslation('help_add');

  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<Category>('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [contact, setContact] = useState('');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {};
    if (title.trim().length < 5) e.title = t('err_title_min');
    if (body.trim().length < 10) e.body = t('err_body_min');
    return e;
  }, [title, body, t]);

  const valid = Object.values(errors).every(v => !v);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      setAttachment(res.assets[0]);
    } catch {
      Alert.alert(t('attach_fail_title'), t('attach_fail_desc'));
    }
  };

  const removeFile = () => setAttachment(null);

  const submit = async () => {
    if (busy || !valid) return;
    setBusy(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: 실제 API 호출 (POST /help/tickets)
      Alert.alert(t('submit_success_title'), t('submit_success_desc'), [
        {
          text: t('ok'),
          onPress: () => router.replace({ pathname: '/help', params: { tab: 'tickets' } }),
        },
      ]);
    } catch {
      Alert.alert(t('error_title'), t('submit_fail_desc'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout
      headerProps={{
        title: t('title'),
        onBackPress: () => router.back(),
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.wrap}
          extraScrollHeight={80}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* 카테고리 세그먼트 */}
          <View style={s.segment}>
            {CATEGORY_KEYS.map(key => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[s.segBtn, active && s.segBtnActive]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t(`category.${key}`)}
                >
                  <Text style={[s.segText, active && s.segTextActive]}>{t(`category.${key}`)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 제목 */}
          <View style={s.field}>
            <Text style={s.label}>{t('title_label')}</Text>
            <TextInput
              style={[s.input, errors.title && s.inputError]}
              placeholder={t('title_ph')}
              value={title}
              onChangeText={setTitle}
              maxLength={120}
              returnKeyType="next"
              accessibilityLabel={t('title_label')}
            />
            {errors.title && <Text style={s.err}>{errors.title}</Text>}
          </View>

          {/* 내용 */}
          <View style={s.field}>
            <Text style={s.label}>{t('body_label')}</Text>
            <TextInput
              style={[s.textarea, errors.body && s.inputError]}
              placeholder={t('body_ph')}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              numberOfLines={8}
              accessibilityLabel={t('body_label')}
            />
            {errors.body && <Text style={s.err}>{errors.body}</Text>}
          </View>

          {/* 연락처 */}
          <View style={s.field}>
            <Text style={s.label}>{t('contact_label')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('contact_ph')}
              value={contact}
              onChangeText={setContact}
              keyboardType="email-address"
              accessibilityLabel={t('contact_label')}
            />
          </View>

          {/* 첨부 */}
          <View style={s.field}>
            <Text style={s.label}>{t('attachment_label')}</Text>
            {attachment ? (
              <View style={s.attachment}>
                <Text style={s.attachName} numberOfLines={1}>
                  {attachment.name}
                </Text>
                <Pressable onPress={removeFile} style={s.attachRemove} accessibilityRole="button" accessibilityLabel={t('file_delete')}>
                  <Text style={s.attachRemoveText}>{t('file_delete')}</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={pickFile} style={s.attachBtn} accessibilityRole="button" accessibilityLabel={t('file_select')}>
                <Text style={s.attachBtnText}>{t('file_select')}</Text>
              </Pressable>
            )}
          </View>

          {/* 제출 */}
          <Pressable
            onPress={submit}
            disabled={!valid || busy}
            style={[s.submit, (!valid || busy) && s.submitDisabled]}
            accessibilityRole="button"
            accessibilityLabel={busy ? t('submitting') : t('submit')}
          >
            <Text style={s.submitText}>{busy ? t('submitting') : t('submit')}</Text>
          </Pressable>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </AppLayout>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 16 },
  segment: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 12, gap: 6 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segBtnActive: { backgroundColor: '#fff', elevation: 1 },
  segText: { fontSize: 13, color: '#555', fontWeight: '600' },
  segTextActive: { color: '#111' },

  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#111' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 140,
    fontSize: 14
  },
  inputError: { borderColor: '#ef4444' },
  err: { color: '#ef4444', fontSize: 12 },

  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 8
  },
  attachName: { flex: 1, fontSize: 13, color: '#111' },
  attachRemove: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fee2e2' },
  attachRemoveText: { color: '#b91c1c', fontSize: 12, fontWeight: '700' },
  attachBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#eef2ff' },
  attachBtnText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },

  submit: { marginTop: 8, paddingVertical: 14, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center' },
  submitDisabled: { backgroundColor: '#9db7ff' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
