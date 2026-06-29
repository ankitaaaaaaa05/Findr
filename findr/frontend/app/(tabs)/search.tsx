import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { ChipRow } from '@/src/components/ChipRow';
import { ListingCard } from '@/src/components/ListingCard';
import { EmptyState } from '@/src/components/EmptyState';
import { Listing } from '@/src/types';
import { listingService } from '@/src/services/listing.service';
import { CATEGORIES } from '@/src/constants';

const STATUS_CHIPS = [
  { label: 'Any status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Matched', value: 'matched' },
  { label: 'Returned', value: 'returned' },
  { label: 'Closed', value: 'closed' },
];

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [semantic, setSemantic] = useState(true);
  const [items, setItems] = useState<Listing[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listingService.browse({
        q: q.trim() || undefined,
        location: location.trim() || undefined,
        category: category || undefined,
        status: status || undefined,
        type: type || undefined,
        semantic,
        limit: 30,
      });
      setItems(res.listings);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [q, location, category, status, type, semantic]);

  const reset = () => {
    setQ(''); setLocation(''); setCategory(''); setStatus(''); setType('');
    setItems([]); setSearched(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Pressable onPress={reset} testID="search-reset">
          <Text style={styles.resetBtn}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={16} color={theme.colors.textMuted} />
        <TextInput
          placeholder="What are you looking for?"
          placeholderTextColor={theme.colors.textFaint}
          value={q}
          onChangeText={setQ}
          style={styles.input}
          testID="search-query-input"
          returnKeyType="search"
          onSubmitEditing={run}
        />
      </View>

      <View style={styles.locationBox}>
        <Feather name="map-pin" size={16} color={theme.colors.textMuted} />
        <TextInput
          placeholder="Location (optional)"
          placeholderTextColor={theme.colors.textFaint}
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          testID="search-location-input"
        />
      </View>

      <View style={styles.aiRow}>
        <View style={styles.aiBadge}>
          <Feather name="cpu" size={12} color={theme.colors.aiAccent} />
          <Text style={styles.aiText}>AI semantic search</Text>
        </View>
        <Switch
          value={semantic}
          onValueChange={setSemantic}
          trackColor={{ false: theme.colors.border, true: theme.colors.aiAccent }}
          testID="search-semantic-toggle"
        />
      </View>

      <Text style={styles.sectionLabel}>Type</Text>
      <ChipRow
        chips={[{ label: 'Any', value: '' }, { label: 'Lost', value: 'lost' }, { label: 'Found', value: 'found' }]}
        value={type}
        onChange={setType}
        testIDPrefix="search-type"
      />
      <Text style={styles.sectionLabel}>Category</Text>
      <ChipRow
        chips={[{ label: 'Any', value: '' }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]}
        value={category}
        onChange={setCategory}
        testIDPrefix="search-cat"
      />
      <Text style={styles.sectionLabel}>Status</Text>
      <ChipRow chips={STATUS_CHIPS} value={status} onChange={setStatus} testIDPrefix="search-status" />

      <Pressable
        onPress={run}
        disabled={loading}
        style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.85 }]}
        testID="search-submit-button"
      >
        <Feather name="search" size={16} color="#FFFFFF" />
        <Text style={styles.searchBtnText}>{loading ? 'Searching…' : 'Search'}</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListEmptyComponent={
          searched ? (
            <EmptyState icon="search" title="No matches" subtitle="Try changing filters or keywords" testID="search-empty" />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { ...theme.font.h2, color: theme.colors.text },
  resetBtn: { color: theme.colors.primary, fontWeight: '600' as const, fontSize: 14 },
  searchBox: {
    marginHorizontal: 20, marginBottom: 10, backgroundColor: theme.colors.surface, borderWidth: 1,
    borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 12, height: 46,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  locationBox: {
    marginHorizontal: 20, marginBottom: 10, backgroundColor: theme.colors.surface, borderWidth: 1,
    borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 12, height: 46,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: theme.colors.text },
  aiRow: {
    marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: theme.colors.aiSoft, padding: 12, borderRadius: 10,
  },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiText: { fontSize: 13, fontWeight: '600' as const, color: theme.colors.aiAccent },
  sectionLabel: { fontSize: 12, fontWeight: '700' as const, color: theme.colors.textMuted, marginLeft: 20, marginTop: 4, marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  searchBtn: {
    marginHorizontal: 20, marginTop: 12, marginBottom: 8, backgroundColor: theme.colors.primary,
    height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700' as const, fontSize: 15 },
  listContent: { padding: 16, paddingBottom: 80, gap: 12 },
  columnWrap: { gap: 12, marginBottom: 12 },
});
