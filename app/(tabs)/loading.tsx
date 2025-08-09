import LottieView from 'lottie-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<{ message: string } | null>(null);

    React.useEffect(() => {
        // 예시: 2초 후에 데이터를 불러온다고 가정
        setTimeout(() => {
            setData({ message: '데이터 불러오기 완료!' });
            setLoading(false);
        }, 2000);
    }, []);

    // 1. 데이터가 아직 로딩 중일 때
    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <LottieView
                    source={require('../../assets/app/loading_animation.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200, marginBottom: 32 }}
                />
                <ActivityIndicator size="large" color="#0050b8" />
                <Text style={{ marginTop: 16 }}>로딩 중입니다...</Text>
            </View>
        );
    }

    // 2. 데이터가 로딩 끝났을 때
    return (
        <View style={styles.container}>
            <Text>실제 화면: {data ? data.message : ''}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
