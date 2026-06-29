import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={[styles.line, { width: '70%' }]} />
        <View style={[styles.line, { width: '50%' }]} />
        <View style={[styles.line, { width: '40%', height: 18, borderRadius: 4 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: 1.1, backgroundColor: theme.colors.surfaceAlt },
  body: { padding: 12, gap: 8 },
  line: { height: 12, backgroundColor: theme.colors.surfaceAlt, borderRadius: 4 },
});
