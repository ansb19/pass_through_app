import React from 'react';
import AppLayout from '../components/AppLayout';

import { Text, View } from 'react-native';
import LoadingScreen from '../components/Loading';

type Data = { message: string } | null;

export default function SomePage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Data>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setData({ message: '완료!' });
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout showHeader showFooter>
      {loading ? (
        <>
          <Text>test</Text>
          <LoadingScreen message="데이터를 불러오는 중입니다..." />
        </>
      ) : (
        <View>
          <Text>{data?.message}</Text>
        </View>
      )}
    </AppLayout>
  );
}
