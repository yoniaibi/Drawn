import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Radius, FontSizes } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'pink' | 'lilac' | 'dark';
}

export default function PrimaryButton({ label, onPress, loading, disabled, style, variant = 'pink' }: Props) {
  const bg = variant === 'pink' ? Colors.pink : variant === 'lilac' ? Colors.lilac : Colors.ink;
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, opacity: disabled || loading ? 0.6 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={Colors.white} />
        : <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: { color: Colors.white, fontSize: FontSizes.base, fontWeight: '700', letterSpacing: 0.1 },
});
