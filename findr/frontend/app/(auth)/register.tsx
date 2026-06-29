import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/contexts/ToastContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { show } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (phone && phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined);
      router.replace('/(tabs)');
    } catch (err) {
      show((err as Error).message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
            <Feather name="chevron-left" size={24} color={theme.colors.text} />
          </Pressable>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>It only takes a minute.</Text>

          <View style={styles.form}>
            <Input
              label="Full name"
              placeholder="Jane Doe"
              value={name}
              onChangeText={setName}
              error={errors.name}
              testID="register-name-input"
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              testID="register-email-input"
            />
            <Input
              label="Phone (optional)"
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              testID="register-phone-input"
            />
            <Input
              label="Password"
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              testID="register-password-input"
            />

            <Button
              title="Create account"
              onPress={onSubmit}
              loading={submitting}
              testID="register-submit-button"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable testID="register-go-to-login">
                <Text style={styles.link}>Log in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, gap: 16 },
  back: { width: 32, height: 32, alignItems: 'flex-start', justifyContent: 'center' },
  title: { ...theme.font.h1, color: theme.colors.text },
  subtitle: { fontSize: 15, color: theme.colors.textMuted, marginTop: -8 },
  form: { gap: 14, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  footerText: { color: theme.colors.textMuted, fontSize: 14 },
  link: { color: theme.colors.primary, fontWeight: '700' as const, fontSize: 14 },
});
