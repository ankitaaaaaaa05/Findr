import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  testID,
  style,
  fullWidth = true,
  icon,
}: Props) {
  const isDisabled = disabled || loading;
  const visual = styles[variant];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        visual.container,
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={visual.text.color as string} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.label, visual.text]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15, fontWeight: '700' as const },
  primary: {
    container: { backgroundColor: theme.colors.primary },
    text: { color: '#FFFFFF' },
  },
  secondary: {
    container: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    text: { color: theme.colors.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: theme.colors.primary },
  },
  danger: {
    container: { backgroundColor: theme.colors.danger },
    text: { color: '#FFFFFF' },
  },
  ai: {
    container: { backgroundColor: theme.colors.aiAccent },
    text: { color: '#FFFFFF' },
  },
});
