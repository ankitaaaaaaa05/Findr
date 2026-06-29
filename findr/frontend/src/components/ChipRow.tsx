import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

interface Chip {
  label: string;
  value: string;
}

interface Props {
  chips: Chip[];
  value: string;
  onChange: (v: string) => void;
  testIDPrefix?: string;
}

export function ChipRow({ chips, value, onChange, testIDPrefix }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {chips.map((c) => {
        const active = c.value === value;
        return (
          <Pressable
            key={c.value}
            testID={testIDPrefix ? `${testIDPrefix}-${c.value || 'all'}` : undefined}
            onPress={() => onChange(c.value)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            <Text style={[styles.text, active ? styles.textActive : styles.textIdle]}>{c.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 56 },
  row: {
    gap: 8,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    height: 56,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipIdle: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  text: { fontSize: 13, fontWeight: '600' as const },
  textActive: { color: '#FFFFFF' },
  textIdle: { color: theme.colors.textMuted },
});
