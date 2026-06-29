import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { ListingStatus, ListingType } from '../types';

const TYPE_STYLE: Record<ListingType, { bg: string; fg: string; label: string }> = {
  lost: { bg: '#FEE2E2', fg: theme.colors.danger, label: 'LOST' },
  found: { bg: '#D1FAE5', fg: theme.colors.success, label: 'FOUND' },
};

const STATUS_STYLE: Record<ListingStatus, { bg: string; fg: string; label: string }> = {
  active: { bg: theme.colors.surface, fg: theme.colors.textMuted, label: 'Active' },
  matched: { bg: '#FEF3C7', fg: theme.colors.warning, label: 'Matched' },
  returned: { bg: '#D1FAE5', fg: theme.colors.success, label: 'Returned' },
  closed: { bg: '#F3F4F6', fg: theme.colors.textFaint, label: 'Closed' },
};

interface TypeBadgeProps { type: ListingType }
export function TypeBadge({ type }: TypeBadgeProps) {
  const s = TYPE_STYLE[type];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg, letterSpacing: 0.5 }]}>{s.label}</Text>
    </View>
  );
}

interface StatusBadgeProps { status: ListingStatus }
export function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700' as const },
});
