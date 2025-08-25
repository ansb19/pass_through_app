import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './Footer';
import Header, { HeaderProps } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  headerProps?: HeaderProps | null;
  style?: object;
}

export default function AppLayout({
  children,
  showFooter = true,
  headerProps = {},
  style,
}: AppLayoutProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right', 'bottom']}>
    {/* <View style={[styles.container, style]}> */}
      {headerProps  && <Header {...headerProps} />}
      <View style={styles.content}>{children}</View>
      {showFooter && <Footer />}
    {/* </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
   safeArea: {
    // backgroundColor: '#000',
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative', 
  },
});
