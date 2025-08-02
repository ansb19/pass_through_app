import React from 'react';
import { StyleSheet, View } from 'react-native';
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
    <View style={[styles.container, style]}>
      {showHeader && <Header {...headerProps} />}
      <View style={styles.content}>{children}</View>
      {showFooter && <Footer {...footerProps} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
