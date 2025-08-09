import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer, { FooterProps } from './Footer';
import Header, { HeaderProps } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerProps?: HeaderProps;
  footerProps?: FooterProps;
  style?: object;
}

export default function AppLayout({
  children,
  showHeader = true,
  showFooter = true,
  headerProps = {},
  footerProps = {},
  style,
}: AppLayoutProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right', 'bottom']}>
    {/* <View style={[styles.container, style]}> */}
      {showHeader && <Header {...headerProps} />}
      <View style={styles.content}>{children}</View>
      {showFooter && <Footer {...footerProps} />}
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
    position: 'relative', // ✅ 이걸 추가하세요!
  },
});
