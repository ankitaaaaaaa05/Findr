import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { Listing } from '../types';
import { StatusBadge, TypeBadge } from './Badges';
import { timeAgo } from '../constants';

interface Props {
  listing: Listing;
  variant?: 'feed' | 'compact';
}

export function ListingCard({ listing, variant = 'feed' }: Props) {
  const router = useRouter();
  const cover = listing.images?.[0];

  return (
    <Pressable
      testID={`listing-card-${listing._id}`}
      onPress={() => router.push(`/listing/${listing._id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.imageWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Feather name="image" size={28} color={theme.colors.textFaint} />
          </View>
        )}
        <View style={styles.typeBadgeWrap}>
          <TypeBadge type={listing.type} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color={theme.colors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>{listing.location}</Text>
        </View>
        <View style={styles.footer}>
          <StatusBadge status={listing.status} />
          {variant === 'feed' && (
            <Text style={styles.time}>{timeAgo(listing.createdAt)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    flex: 1,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1.1, backgroundColor: theme.colors.surface },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  typeBadgeWrap: { position: 'absolute', top: 8, left: 8 },
  body: { padding: 12, gap: 6 },
  title: { fontSize: 14, fontWeight: '700' as const, color: theme.colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 12, color: theme.colors.textMuted, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  time: { fontSize: 11, color: theme.colors.textFaint },
});
