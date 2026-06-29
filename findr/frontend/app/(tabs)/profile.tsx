import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { theme } from '@/src/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/contexts/ToastContext';
import { listingService } from '@/src/services/listing.service';
import { Listing } from '@/src/types';
import { ListingCard } from '@/src/components/ListingCard';
import { EmptyState } from '@/src/components/EmptyState';
import { Button } from '@/src/components/Button';

export default function ProfileScreen() {
  const { user, logout, refresh } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const [mine, setMine] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await listingService.mine();
      setMine(res.listings);
    } catch (e) {
      show((e as Error).message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [show]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const initials = (user?.name || 'U N').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const counts = {
    total: mine.length,
    lost: mine.filter((l) => l.type === 'lost').length,
    found: mine.filter((l) => l.type === 'found').length,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={mine}
        keyExtractor={(it) => it._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); load(); }} />
        }
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} testID="profile-name">{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
              </View>
              <Pressable onPress={() => router.push('/profile/edit')} hitSlop={8} testID="profile-edit-button" style={styles.iconBtn}>
                <Feather name="edit-2" size={16} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <Stat label="Listings" value={counts.total} />
              <Stat label="Lost" value={counts.lost} color={theme.colors.danger} />
              <Stat label="Found" value={counts.found} color={theme.colors.success} />
            </View>

            <Button title="Log out" onPress={onLogout} variant="secondary" testID="profile-logout-button" />

            <Text style={styles.sectionTitle}>My listings</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon="package" title="You haven't posted yet" subtitle="Tap Post to create your first listing" />
          )
        }
      />
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, gap: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700' as const, color: theme.colors.primary },
  name: { fontSize: 18, fontWeight: '700' as const, color: theme.colors.text },
  email: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  phone: { fontSize: 13, color: theme.colors.textMuted },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
  },
  statValue: { fontSize: 20, fontWeight: '800' as const, color: theme.colors.text },
  statLabel: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  sectionTitle: { ...theme.font.h3, color: theme.colors.text, marginTop: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },
  columnWrap: { gap: 12, marginBottom: 12 },
});
