import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { Listing } from '@/src/types';
import { listingService } from '@/src/services/listing.service';
import { ListingCard } from '@/src/components/ListingCard';
import { ChipRow } from '@/src/components/ChipRow';
import { SkeletonCard } from '@/src/components/SkeletonCard';
import { EmptyState } from '@/src/components/EmptyState';
import { CATEGORIES } from '@/src/constants';

const TYPE_CHIPS = [
  { label: 'All', value: '' },
  { label: 'Lost', value: 'lost' },
  { label: 'Found', value: 'found' },
];

const CATEGORY_CHIPS = [{ label: 'Any', value: '' }, ...CATEGORIES.map((c) => ({ label: c, value: c }))];

export default function HomeScreen() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (opts?: { reset?: boolean; nextPage?: number }) => {
      const reset = opts?.reset ?? false;
      const nextPage = opts?.nextPage ?? 1;
      try {
        if (reset) setLoading(true);
        const res = await listingService.browse({
          q: query.trim() || undefined,
          type: type || undefined,
          category: category || undefined,
          page: nextPage,
          limit: 12,
        });
        setItems(reset ? res.listings : [...items, ...res.listings]);
        setHasMore(res.hasMore);
        setPage(nextPage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, type, category]
  );

  useEffect(() => {
    load({ reset: true, nextPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category]);

  const onRefresh = () => {
    setRefreshing(true);
    load({ reset: true, nextPage: 1 });
  };

  const onSearchSubmit = () => load({ reset: true, nextPage: 1 });

  const onEndReached = () => {
    if (!loading && hasMore) load({ nextPage: page + 1 });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Lost something?</Text>
          <Text style={styles.sub}>Browse what others found nearby</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={theme.colors.textMuted} />
        <TextInput
          placeholder="Search title, brand, location..."
          placeholderTextColor={theme.colors.textFaint}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          style={styles.search}
          testID="home-search-input"
        />
        {query ? (
          <Pressable onPress={() => { setQuery(''); load({ reset: true, nextPage: 1 }); }} hitSlop={10}>
            <Feather name="x" size={16} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <ChipRow chips={TYPE_CHIPS} value={type} onChange={setType} testIDPrefix="filter-type" />
      <ChipRow chips={CATEGORY_CHIPS} value={category} onChange={setCategory} testIDPrefix="filter-cat" />

      <FlatList
        data={loading ? Array.from({ length: 6 }).map((_, i) => ({ _id: `s-${i}` } as Listing)) : items}
        keyExtractor={(it) => it._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (loading ? <SkeletonCard /> : <ListingCard listing={item} />)}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="package"
              title="No listings yet"
              subtitle="Be the first to post a lost or found item"
              testID="home-empty-state"
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  greeting: { fontSize: 22, fontWeight: '800' as const, color: theme.colors.text, letterSpacing: -0.3 },
  sub: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  search: { flex: 1, fontSize: 14, color: theme.colors.text },
  listContent: { padding: 16, paddingBottom: 80, gap: 12 },
  columnWrap: { gap: 12, marginBottom: 12 },
});
