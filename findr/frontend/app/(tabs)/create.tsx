import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '@/src/theme';
import { Button } from '@/src/components/Button';
import { ListingForm, ListingDraft, emptyDraft } from '@/src/components/ListingForm';
import { listingService } from '@/src/services/listing.service';
import { useToast } from '@/src/contexts/ToastContext';

type Step = 'choose' | 'ai-pick' | 'ai-text' | 'form';

export default function CreateScreen() {
  const router = useRouter();
  const { show } = useToast();
  const [step, setStep] = useState<Step>('choose');
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft());
  const [text, setText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setStep('choose');
    setDraft(emptyDraft());
    setText('');
  }

  async function submit() {
    try {
      setSubmitting(true);
      const { listing } = await listingService.create(draft);
      show('Listing posted!', 'success');
      reset();
      router.push(`/listing/${listing._id}`);
    } catch (e) {
      show((e as Error).message || 'Failed to post', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function runFromText() {
    if (text.trim().length < 4) {
      show('Write at least a few words', 'error');
      return;
    }
    try {
      setAiLoading(true);
      const { suggestion } = await listingService.aiFromText(text.trim());
      setDraft((d) => ({
        ...d,
        title: suggestion.title || d.title,
        description: suggestion.description || d.description,
        category: suggestion.category || d.category,
        brand: suggestion.brand || d.brand,
        color: suggestion.color || d.color,
        tags: suggestion.tags || d.tags,
      }));
      setStep('form');
    } catch (e) {
      show((e as Error).message || 'AI request failed', 'error');
    } finally {
      setAiLoading(false);
    }
  }

  async function runFromImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        show('Photos permission needed', 'error');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
      });
      if (res.canceled || !res.assets?.[0]?.base64) return;
      const img = res.assets[0];
      const b64 = img.base64!;
      setAiLoading(true);
      const { suggestion } = await listingService.aiFromImage(b64, 'image/jpeg');
      setDraft((d) => ({
        ...d,
        title: suggestion.title || d.title,
        description: suggestion.description || d.description,
        category: suggestion.category || d.category,
        brand: suggestion.brand || d.brand,
        color: suggestion.color || d.color,
        tags: suggestion.tags || d.tags,
        images: [`data:image/jpeg;base64,${b64}`, ...d.images].slice(0, 6),
      }));
      setStep('form');
    } catch (e) {
      show((e as Error).message || 'AI vision failed', 'error');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        {step !== 'choose' ? (
          <Pressable onPress={() => (step === 'form' ? setStep('choose') : setStep('choose'))} hitSlop={10}>
            <Feather name="chevron-left" size={24} color={theme.colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.title}>New listing</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        {step === 'choose' && (
          <ScrollView contentContainerStyle={styles.choose}>
            <View style={styles.aiHero}>
              <View style={styles.aiHeroIcon}><Feather name="cpu" size={20} color="#FFFFFF" /></View>
              <Text style={styles.aiHeroTitle}>Enable AI assistance?</Text>
              <Text style={styles.aiHeroSub}>Let AI fill in the title, description, and category for you. You can edit everything before posting.</Text>

              <Pressable style={styles.choice} onPress={runFromImage} testID="create-ai-from-image">
                <View style={[styles.choiceIcon, { backgroundColor: theme.colors.aiSoft }]}>
                  <Feather name="image" size={18} color={theme.colors.aiAccent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.choiceTitle}>Generate from image</Text>
                  <Text style={styles.choiceSub}>Take or upload a photo, AI does the rest</Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
              </Pressable>

              <Pressable style={styles.choice} onPress={() => setStep('ai-text')} testID="create-ai-from-text">
                <View style={[styles.choiceIcon, { backgroundColor: theme.colors.aiSoft }]}>
                  <Feather name="message-square" size={18} color={theme.colors.aiAccent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.choiceTitle}>Generate from one sentence</Text>
                  <Text style={styles.choiceSub}>e.g. &quot;I lost my black Nike bag at the library&quot;</Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.manualBtn} onPress={() => setStep('form')} testID="create-manual">
              <Feather name="edit-3" size={16} color={theme.colors.text} />
              <Text style={styles.manualBtnText}>Continue manually</Text>
            </Pressable>
          </ScrollView>
        )}

        {step === 'ai-text' && (
          <ScrollView contentContainerStyle={styles.aiTextWrap}>
            <View style={styles.aiCard}>
              <View style={styles.aiBadge}>
                <Feather name="cpu" size={12} color={theme.colors.aiAccent} />
                <Text style={styles.aiBadgeText}>AI text-to-listing</Text>
              </View>
              <Text style={styles.aiCardTitle}>Describe it in one sentence</Text>
              <TextInput
                placeholder="I lost my black Nike backpack near the college library"
                placeholderTextColor={theme.colors.textFaint}
                value={text}
                onChangeText={setText}
                style={styles.aiTextInput}
                multiline
                numberOfLines={4}
                testID="ai-text-input"
              />
              <Button
                title={aiLoading ? 'Generating…' : 'Generate listing'}
                onPress={runFromText}
                loading={aiLoading}
                variant="ai"
                testID="ai-text-submit"
              />
            </View>
          </ScrollView>
        )}

        {step === 'form' && (
          <ListingForm
            draft={draft}
            onChange={setDraft}
            onSubmit={submit}
            submitting={submitting}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '700' as const, color: theme.colors.text },
  choose: { padding: 20, gap: 18 },
  aiHero: {
    borderRadius: 16,
    backgroundColor: theme.colors.aiSoft,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  aiHeroIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.aiAccent,
    alignItems: 'center', justifyContent: 'center',
  },
  aiHeroTitle: { fontSize: 18, fontWeight: '800' as const, color: theme.colors.text },
  aiHeroSub: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 8 },
  choice: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.colors.border,
  },
  choiceIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { fontSize: 14, fontWeight: '700' as const, color: theme.colors.text },
  choiceSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { fontSize: 12, color: theme.colors.textFaint, fontWeight: '600' as const },
  manualBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface,
  },
  manualBtnText: { fontSize: 15, fontWeight: '700' as const, color: theme.colors.text },
  aiTextWrap: { padding: 20 },
  aiCard: { backgroundColor: theme.colors.aiSoft, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#E9D5FF' },
  aiBadge: { flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  aiBadgeText: { fontSize: 11, fontWeight: '700' as const, color: theme.colors.aiAccent, letterSpacing: 0.3 },
  aiCardTitle: { fontSize: 16, fontWeight: '700' as const, color: theme.colors.text },
  aiTextInput: {
    minHeight: 110, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9D5FF',
    padding: 12, fontSize: 15, color: theme.colors.text, textAlignVertical: 'top' as const,
  },
});
