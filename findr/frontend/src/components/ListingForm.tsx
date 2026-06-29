import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

import { theme } from '../theme';
import { Input } from './Input';
import { Button } from './Button';
import { ChipRow } from './ChipRow';
import { Listing, ListingStatus, ListingType } from '../types';
import { CATEGORIES, STATUSES, formatDate } from '../constants';

export interface ListingDraft {
  type: ListingType;
  title: string;
  description: string;
  category: string;
  color?: string;
  brand?: string;
  location: string;
  date: string; // ISO
  reward?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  images: string[];
  tags: string[];
  status?: ListingStatus;
}

export function emptyDraft(seed: Partial<ListingDraft> = {}): ListingDraft {
  return {
    type: 'lost',
    title: '',
    description: '',
    category: 'Other',
    color: '',
    brand: '',
    location: '',
    date: new Date().toISOString(),
    reward: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    images: [],
    tags: [],
    status: 'active',
    ...seed,
  };
}

export function listingToDraft(l: Listing): ListingDraft {
  return {
    type: l.type,
    title: l.title,
    description: l.description,
    category: l.category,
    color: l.color || '',
    brand: l.brand || '',
    location: l.location,
    date: l.date,
    reward: l.reward || '',
    contactName: l.contactName || '',
    contactPhone: l.contactPhone || '',
    contactEmail: l.contactEmail || '',
    images: l.images || [],
    tags: l.tags || [],
    status: l.status,
  };
}

interface Props {
  draft: ListingDraft;
  onChange: (next: ListingDraft) => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  showStatus?: boolean;
}

export function ListingForm({ draft, onChange, onSubmit, submitting, submitLabel = 'Post listing', showStatus }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ListingDraft>(k: K, v: ListingDraft[K]) => onChange({ ...draft, [k]: v });

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to add images.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    const b64 = a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri;
    set('images', [...draft.images, b64].slice(0, 6));
  }

  function removeImage(i: number) {
    set('images', draft.images.filter((_, idx) => idx !== i));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (draft.title.trim().length < 2) e.title = 'Title is required';
    if (draft.description.trim().length < 5) e.description = 'Add a short description';
    if (!draft.category) e.category = 'Pick a category';
    if (draft.location.trim().length < 2) e.location = 'Where was it?';
    if (draft.contactEmail && !/^\S+@\S+\.\S+$/.test(draft.contactEmail)) e.contactEmail = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    onSubmit();
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>I am posting a</Text>
      <ChipRow
        chips={[{ label: 'Lost item', value: 'lost' }, { label: 'Found item', value: 'found' }]}
        value={draft.type}
        onChange={(v) => set('type', v as ListingType)}
        testIDPrefix="form-type"
      />

      <View style={styles.imageRow}>
        {draft.images.map((src, i) => (
          <View key={`${i}-${src.slice(0, 12)}`} style={styles.imageThumbWrap}>
            <Image source={{ uri: src }} style={styles.imageThumb} />
            <Pressable style={styles.imageRemove} onPress={() => removeImage(i)} testID={`form-remove-image-${i}`}>
              <Feather name="x" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}
        {draft.images.length < 6 && (
          <Pressable style={styles.imageAdd} onPress={pickImage} testID="form-add-image">
            <Feather name="image" size={22} color={theme.colors.textMuted} />
            <Text style={styles.imageAddText}>Add</Text>
          </Pressable>
        )}
      </View>

      <Input
        label="Title"
        placeholder="e.g. Black Nike backpack"
        value={draft.title}
        onChangeText={(v) => set('title', v)}
        error={errors.title}
        testID="form-title-input"
      />
      <Input
        label="Description"
        placeholder="Write a few details that would help identify it"
        multiline
        numberOfLines={4}
        value={draft.description}
        onChangeText={(v) => set('description', v)}
        error={errors.description}
        style={{ minHeight: 96, textAlignVertical: 'top' as const }}
        testID="form-description-input"
      />

      <Text style={styles.sectionLabel}>Category</Text>
      <ChipRow
        chips={CATEGORIES.map((c) => ({ label: c, value: c }))}
        value={draft.category}
        onChange={(v) => set('category', v)}
        testIDPrefix="form-cat"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Color" placeholder="Black" value={draft.color} onChangeText={(v) => set('color', v)} testID="form-color-input" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Brand" placeholder="Nike" value={draft.brand} onChangeText={(v) => set('brand', v)} testID="form-brand-input" />
        </View>
      </View>

      <Input
        label="Location"
        placeholder="Where was it lost or found?"
        value={draft.location}
        onChangeText={(v) => set('location', v)}
        error={errors.location}
        testID="form-location-input"
      />

      <View>
        <Text style={styles.fieldLabel}>Date</Text>
        <Pressable
          style={styles.dateBtn}
          onPress={() => setShowPicker(true)}
          testID="form-date-button"
        >
          <Feather name="calendar" size={16} color={theme.colors.textMuted} />
          <Text style={styles.dateBtnText}>{formatDate(draft.date)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={new Date(draft.date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              setShowPicker(Platform.OS === 'ios');
              if (d) set('date', d.toISOString());
            }}
            maximumDate={new Date()}
          />
        )}
      </View>

      <Input
        label="Reward (optional)"
        placeholder="e.g. $20 or chocolates"
        value={draft.reward}
        onChangeText={(v) => set('reward', v)}
        testID="form-reward-input"
      />

      <Text style={styles.sectionLabel}>Contact</Text>
      <Input label="Name" placeholder="How you want to be reached" value={draft.contactName} onChangeText={(v) => set('contactName', v)} testID="form-contact-name" />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Phone" placeholder="Phone" keyboardType="phone-pad" value={draft.contactPhone} onChangeText={(v) => set('contactPhone', v)} testID="form-contact-phone" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Email" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={draft.contactEmail} onChangeText={(v) => set('contactEmail', v)} error={errors.contactEmail} testID="form-contact-email" />
        </View>
      </View>

      {showStatus && (
        <>
          <Text style={styles.sectionLabel}>Status</Text>
          <ChipRow
            chips={STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
            value={draft.status || 'active'}
            onChange={(v) => set('status', v as ListingStatus)}
            testIDPrefix="form-status"
          />
        </>
      )}

      <Button
        title={submitLabel}
        onPress={submit}
        loading={submitting}
        testID="form-submit-button"
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  sectionLabel: { fontSize: 12, fontWeight: '700' as const, color: theme.colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginTop: 4, marginLeft: 2 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 76, height: 76, borderRadius: 10, backgroundColor: theme.colors.surface },
  imageRemove: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },
  imageAdd: {
    width: 76, height: 76, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border,
    borderStyle: 'dashed' as const, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: theme.colors.surface,
  },
  imageAddText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' as const },
  row: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: theme.colors.text, marginBottom: 6 },
  dateBtn: {
    minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.surface,
  },
  dateBtnText: { fontSize: 15, color: theme.colors.text },
});
