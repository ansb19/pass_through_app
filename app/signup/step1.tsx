import { useRouter } from 'expo-router';
import React from 'react';
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AppLayout from '../components/AppLayout';

export default function SignupStepOneScreen() {
    const router = useRouter();

    return (
        <AppLayout
            showHeader={true}
            showFooter={false}
            headerProps={{
                title: '회원가입',
                showBack: true,
                onBackPress: () => router.back(),
            }}
        >

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    {/* 📦 키보드-aware 스크롤 영역 */}
                    <KeyboardAwareScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.container}
                        extraScrollHeight={40} // 키보드 높이만큼 여유 공간 추가
                        scrollEnabled={true}
                        enableOnAndroid={true}
                        keyboardShouldPersistTaps="handled"
                        enableAutomaticScroll={true}
                        extraHeight={75} // 추가 오프셋
                        enableResetScrollToCoords={true} // 스크롤 위치 초기화 허용
                    >
                        <View style={styles.wrapper}>
                            {/* 스크롤되는 입력 영역 */}
                            <Text style={styles.label}>닉네임</Text>
                            <TextInput style={styles.input} placeholder="닉네임 입력" />

                            <Text style={styles.label}>이메일</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="example@email.com"
                                    keyboardType="email-address"
                                />
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>인증</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>휴대폰 번호</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="010-0000-0000"
                                    keyboardType="phone-pad"
                                />
                                <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>인증</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 아래 고정 버튼 때문에 공간 확보 */}
                            <View style={{ height: 80 }} />
                        </View>
                    </KeyboardAwareScrollView>

                    {/* 하단 고정 버튼 */}
                    <View style={styles.fixedBottom}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() => router.push('/signup/step2')}
                        >
                            <Text style={styles.nextText}>다음</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </AppLayout >
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        position: 'relative',

    },
    container: {
        padding: 20,
        paddingTop: 32,
        paddingBottom: 140,
        flexGrow: 1,

    },
    label: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 6,
        marginTop: 16,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        lineHeight: 22, // ← 이 부분 추가!
        textAlignVertical: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    fixedBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#f9fafc',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    nextButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
