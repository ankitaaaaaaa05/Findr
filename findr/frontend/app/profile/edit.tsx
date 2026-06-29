import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '@/src/theme';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/contexts/ToastContext';
import { api } from '@/src/services/api';
import { User } from '@/src/types';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);
      const { user: updated } = await api.put<{ user: User }>('/users/me', { name, phone, bio });
      updateUser(updated);
      show('Profile updated', 'success');
      router.back();
    } catch (e) {
      show((e as Error).message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="profile-edit-back">
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Full name" value={name} onChangeText={setName} testID="profile-edit-name" />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="profile-edit-phone" />
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="A short note about yourself"
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: 'top' as const }}
            testID="profile-edit-bio"
          />
          <Button title="Save changes" onPress={save} loading={saving} testID="profile-edit-save" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomColor: theme.colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 17, fontWeight: '700' as const, color: theme.colors.text },
  content: { padding: 20, gap: 14 },
});
