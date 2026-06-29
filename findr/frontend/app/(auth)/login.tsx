import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { theme } from '@/src/theme';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/contexts/ToastContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { show } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!email || !password) {
      show('Enter your email and password', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e) {
      show((e as Error).message || 'Login failed', 'error');
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
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Feather name="search" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.brandText}>Findr</Text>
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to post and track lost items in your area.</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              testID="login-email-input"
            />
            <View>
              <Input
                label="Password"
                placeholder="At least 6 characters"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
                testID="login-password-input"
              />
              <Pressable
                onPress={() => setShowPwd((v) => !v)}
                style={styles.eye}
                hitSlop={10}
                testID="login-toggle-password"
              >
                <Feather name={showPwd ? 'eye-off' : 'eye'} size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <Button
              title="Log in"
              onPress={onSubmit}
              loading={submitting}
              testID="login-submit-button"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable testID="login-go-to-register">
                <Text style={styles.link}>Sign up</Text>
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
  content: { padding: 24, gap: 18 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  logo: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { fontSize: 18, fontWeight: '800' as const, color: theme.colors.text, letterSpacing: -0.3 },
  title: { ...theme.font.h1, color: theme.colors.text, marginTop: 16 },
  subtitle: { fontSize: 15, color: theme.colors.textMuted, marginTop: -6 },
  form: { gap: 14, marginTop: 8 },
  eye: { position: 'absolute', right: 14, bottom: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  footerText: { color: theme.colors.textMuted, fontSize: 14 },
  link: { color: theme.colors.primary, fontWeight: '700' as const, fontSize: 14 },
});
