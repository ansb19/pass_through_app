import AppLayout from '@/app/components/AppLayout';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <AppLayout
      showHeader={true}
      showFooter={true}
      headerProps={{
        title: '홈',
        showBack: false,
        showSearch: true,
        onSearchPress: () => alert('검색 클릭!'),
      }}
      footerProps={{
        activeTab: 'home',
        onTabChange: tab => alert(`탭 변경: ${tab}`),
      }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageBox}>
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        </View>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Step 1: Try it</Text>
        <Text style={styles.text}>
          Edit <Text style={styles.bold}>app/(tabs)/index.tsx</Text> to see changes.
          {'\n'}Press{' '}
          <Text style={styles.bold}>
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </Text>{' '}
          to open developer tools.
        </Text>
        <Text style={styles.subtitle}>Step 2: Explore</Text>
        <Text style={styles.text}>
          Tap the Explore tab to learn more about what&apos;s included in this starter app.
        </Text>
        <Text style={styles.subtitle}>Step 3: Get a fresh start</Text>
        <Text style={styles.text}>
          When you&apos;re ready, run <Text style={styles.bold}>npm run reset-project</Text> to get a fresh{' '}
          <Text style={styles.bold}>app</Text> directory. This will move the current <Text style={styles.bold}>app</Text> to{' '}
          <Text style={styles.bold}>app-example</Text>.
        </Text>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'flex-start',
  },
  imageBox: {
    alignSelf: 'stretch',
    height: 120,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactLogo: {
    width: 180,
    height: 110,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2265d4',
  },
});
