import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  bg?: string;
}

export default function ScreenWrapper({ children, style, bg = Colors.darkBg }: Props) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={[styles.inner, { backgroundColor: bg }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});
