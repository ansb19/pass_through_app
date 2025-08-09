import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
}

export default function Header({
  title = '',
  showBack = false,
  showSearch = false,
  onBackPress,
  onSearchPress,
}: HeaderProps) 
{
  const { t } = useTranslation();
  return (
    
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={onBackPress} style={styles.button}>
          <Text style={styles.icon}>◀</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
      <Text style={styles.title}>{title ?? t('appName')}</Text>
      {showSearch ? (
        <TouchableOpacity onPress={onSearchPress} style={styles.button}>
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
    </View>
    
  );
}

const styles = StyleSheet.create({
  
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  button: {
    width: 32,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
