import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { theme } from '@/src/theme';
import { listingService } from '@/src/services/listing.service';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/contexts/ToastContext';
import { Listing, MatchResult } from '@/src/types';
import { StatusBadge, TypeBadge } from '@/src/components/Badges';
import { Button } from '@/src/components/Button';
import { formatDate } from '@/src/constants';
import { ListingCard } from '@/src/components/ListingCard';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { show } = useToast();
  const insets = useSafeAreaInsets();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ownerId = typeof listing?.user === 'string' ? listing?.user : listing?.user?._id;
  const isOwner = !!user && !!ownerId && ownerId === user.id;
  const owner = typeof listing?.user === 'string' ? null : listing?.user;

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { listing } = await listingService.get(id);
      setListing(listing);
    } catch (e) {
      show((e as Error).message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, show]);

  useEffect(() => { load(); }, [load]);

  async function runMatches() {
    if (!id) return;
    try {
      setMatchLoading(true);
      const res = await listingService.matches(id);
      setMatches(res.matches);
      if (res.matches.length === 0) show('No likely matches yet', 'info');
    } catch (e) {
      show((e as Error).message || 'Match failed', 'error');
    } finally {
      setMatchLoading(false);
    }
  }

  async function doDelete() {
    if (!id) return;
    try {
      await listingService.remove(id);
      show('Listing deleted', 'success');
      router.back();
    } catch (e) {
      show((e as Error).message || 'Delete failed', 'error');
    }
  }

  if (loading || !listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="detail-back">
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{listing.title}</Text>
        {isOwner ? (
          <Pressable onPress={() => router.push(`/listing/edit/${listing._id}`)} hitSlop={10} testID="detail-edit">
            <Feather name="edit-2" size={18} color={theme.colors.text} />
          </Pressable>
        ) : <View style={{ width: 24 }} />}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}>
        {/* Image gallery */}
        {listing.images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {listing.images.map((src, i) => (
              <Pressable key={i} onPress={() => setZoom(src)}>
                <Image source={{ uri: src }} style={styles.hero} resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.hero, styles.heroEmpty]}>
            <Feather name="image" size={36} color={theme.colors.textFaint} />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.row}>
            <TypeBadge type={listing.type} />
            <StatusBadge status={listing.status} />
          </View>
          <Text style={styles.title} testID="detail-title">{listing.title}</Text>

          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color={theme.colors.textMuted} />
            <Text style={styles.meta}>{listing.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={14} color={theme.colors.textMuted} />
            <Text style={styles.meta}>{formatDate(listing.date)}</Text>
          </View>

          <Text style={styles.section}>Details</Text>
          <View style={styles.grid}>
            <Spec label="Category" value={listing.category} />
            <Spec label="Color" value={listing.color || '—'} />
            <Spec label="Brand" value={listing.brand || '—'} />
            <Spec label="Reward" value={listing.reward || '—'} />
          </View>

          <Text style={styles.section}>Description</Text>
          <Text style={styles.desc}>{listing.description}</Text>

          {listing.tags?.length ? (
            <View style={styles.tagRow}>
              {listing.tags.map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
              ))}
            </View>
          ) : null}

          {owner && (
            <>
              <Text style={styles.section}>Posted by</Text>
              <View style={styles.contactRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(owner.name || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{owner.name}</Text>
                  {(listing.contactPhone || owner.phone) ? (
                    <Text style={styles.contactMeta}>{listing.contactPhone || owner.phone}</Text>
                  ) : null}
                </View>
              </View>
            </>
          )}

          {isOwner && (
            <>
              <View style={styles.aiBox}>
                <View style={styles.aiHeader}>
                  <View style={styles.aiBadge}>
                    <Feather name="cpu" size={12} color={theme.colors.aiAccent} />
                    <Text style={styles.aiBadgeText}>AI matching</Text>
                  </View>
                  <Text style={styles.aiTitle}>Find possible matches</Text>
                </View>
                <Text style={styles.aiSub}>
                  We&apos;ll compare your {listing.type} item against recent {listing.type === 'lost' ? 'found' : 'lost'} posts and rank them by confidence.
                </Text>
                <Button
                  title={matchLoading ? 'Searching matches…' : matches ? 'Re-run AI match' : 'Run AI match'}
                  onPress={runMatches}
                  loading={matchLoading}
                  variant="ai"
                  testID="detail-run-match"
                />
              </View>

              {matches && matches.length > 0 && (
                <>
                  <Text style={styles.section}>Possible matches</Text>
                  {matches.map((m) => (
                    <View key={m.listing._id} style={styles.matchRow}>
                      <View style={{ flex: 1 }}>
                        <ListingCard listing={m.listing} variant="compact" />
                      </View>
                      <View style={styles.matchScore}>
                        <Text style={styles.matchScoreNum}>{m.score}%</Text>
                        <Text style={styles.matchScoreLabel}>confidence</Text>
                        {m.matchedAttributes.length > 0 && (
                          <Text style={styles.matchAttrs}>{m.matchedAttributes.join(', ')}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: 12 + insets.bottom }]}>
        {isOwner ? (
          <>
            <Pressable style={[styles.barBtn, styles.barGhost]} onPress={() => setConfirmDelete(true)} testID="detail-delete">
              <Feather name="trash-2" size={16} color={theme.colors.danger} />
              <Text style={[styles.barBtnText, { color: theme.colors.danger }]}>Delete</Text>
            </Pressable>
            <Pressable style={[styles.barBtn, styles.barPrimary]} onPress={() => router.push(`/listing/edit/${listing._id}`)}>
              <Feather name="edit-2" size={16} color="#FFFFFF" />
              <Text style={[styles.barBtnText, { color: '#FFFFFF' }]}>Edit listing</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.barBtn, styles.barPrimary, { flex: 1 }]}
            onPress={() => {
              const phone = listing.contactPhone || (owner?.phone || '');
              const email = listing.contactEmail || '';
              if (phone) Linking.openURL(`tel:${phone}`);
              else if (email) Linking.openURL(`mailto:${email}`);
              else show('No contact info available', 'info');
            }}
            testID="detail-contact"
          >
            <Feather name="phone" size={16} color="#FFFFFF" />
            <Text style={[styles.barBtnText, { color: '#FFFFFF' }]}>Contact owner</Text>
          </Pressable>
        )}
      </View>

      {/* Zoom modal */}
      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <Pressable style={styles.zoomBg} onPress={() => setZoom(null)}>
          {zoom && <Image source={{ uri: zoom }} style={styles.zoomImg} resizeMode="contain" />}
          <Pressable style={styles.zoomClose} onPress={() => setZoom(null)}>
            <Feather name="x" size={22} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete confirm */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <View style={styles.confirmBg}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete listing?</Text>
            <Text style={styles.confirmText}>This cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button title="Cancel" onPress={() => setConfirmDelete(false)} variant="secondary" />
              <Button title="Delete" onPress={() => { setConfirmDelete(false); doDelete(); }} variant="danger" testID="confirm-delete-button" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: theme.colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 15, fontWeight: '700' as const, color: theme.colors.text, flex: 1, marginHorizontal: 12 },
  hero: { width: 360, height: 320, backgroundColor: theme.colors.surface },
  heroEmpty: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  body: { padding: 20, gap: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  title: { ...theme.font.h2, color: theme.colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { fontSize: 14, color: theme.colors.textMuted },
  section: { ...theme.font.h3, color: theme.colors.text, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spec: { flex: 1, minWidth: '47%', padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  specLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, fontWeight: '600' as const },
  specValue: { fontSize: 14, color: theme.colors.text, marginTop: 4, fontWeight: '600' as const },
  desc: { fontSize: 15, lineHeight: 22, color: theme.colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: theme.colors.primarySoft, borderRadius: 999 },
  tagText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' as const },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.primary, fontWeight: '700' as const },
  contactName: { fontWeight: '700' as const, fontSize: 14, color: theme.colors.text },
  contactMeta: { color: theme.colors.textMuted, fontSize: 13 },
  aiBox: { marginTop: 12, padding: 16, borderRadius: 14, backgroundColor: theme.colors.aiSoft, borderWidth: 1, borderColor: '#E9D5FF', gap: 10 },
  aiHeader: { gap: 6 },
  aiBadge: { flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  aiBadgeText: { fontSize: 11, fontWeight: '700' as const, color: theme.colors.aiAccent, letterSpacing: 0.3 },
  aiTitle: { fontSize: 15, fontWeight: '700' as const, color: theme.colors.text },
  aiSub: { fontSize: 13, color: theme.colors.textMuted },
  matchRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  matchScore: { width: 110, padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center' },
  matchScoreNum: { fontSize: 22, fontWeight: '800' as const, color: theme.colors.aiAccent },
  matchScoreLabel: { fontSize: 11, color: theme.colors.textMuted },
  matchAttrs: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4 },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12,
    flexDirection: 'row', gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border,
  },
  barBtn: { flex: 1, minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  barPrimary: { backgroundColor: theme.colors.primary },
  barGhost: { backgroundColor: '#FEE2E2' },
  barBtnText: { fontWeight: '700' as const, fontSize: 14 },
  zoomBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  zoomImg: { width: '100%', height: '80%' },
  zoomClose: { position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  confirmBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, width: '100%', maxWidth: 360 },
  confirmTitle: { fontSize: 17, fontWeight: '700' as const, color: theme.colors.text },
  confirmText: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
});
