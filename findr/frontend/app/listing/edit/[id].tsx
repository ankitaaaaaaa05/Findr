import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { theme } from '@/src/theme';
import { ListingForm, ListingDraft, emptyDraft, listingToDraft } from '@/src/components/ListingForm';
import { listingService } from '@/src/services/listing.service';
import { useToast } from '@/src/contexts/ToastContext';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const { listing } = await listingService.get(id);
        setDraft(listingToDraft(listing));
      } catch (e) {
        show((e as Error).message || 'Failed to load', 'error');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, show, router]);

  async function submit() {
    if (!id) return;
    try {
      setSubmitting(true);
      await listingService.update(id, draft);
      show('Listing updated', 'success');
      router.back();
    } catch (e) {
      show((e as Error).message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="edit-back">
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit listing</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
          <ListingForm
            draft={draft}
            onChange={setDraft}
            onSubmit={submit}
            submitting={submitting}
            submitLabel="Save changes"
            showStatus
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: theme.colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 17, fontWeight: '700' as const, color: theme.colors.text },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
