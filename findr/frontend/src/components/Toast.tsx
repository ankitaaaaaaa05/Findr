import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';

export type ToastKind = 'success' | 'error' | 'info';

interface Props {
  visible: boolean;
  message: string;
  kind?: ToastKind;
  onHide?: () => void;
}

const ICON: Record<ToastKind, keyof typeof Feather.glyphMap> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};

const COLOR: Record<ToastKind, string> = {
  success: theme.colors.success,
  error: theme.colors.danger,
  info: theme.colors.primary,
};

export function Toast({ visible, message, kind = 'info', onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => onHide?.());
      }, 2200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [visible, opacity, onHide]);

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="box-none" style={[styles.wrap, { opacity }]}>
      <Pressable onPress={onHide} style={styles.toast}>
        <View style={[styles.dot, { backgroundColor: COLOR[kind] }]}>
          <Feather name={ICON[kind]} size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.text} numberOfLines={2}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' as const, flex: 1 },
});
