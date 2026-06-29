export const theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceAlt: '#F3F4F6',
    border: '#E5E7EB',
    text: '#0A0A0A',
    textMuted: '#6B7280',
    textFaint: '#9CA3AF',
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primarySoft: '#EEF2FF',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    aiAccent: '#8B5CF6',
    aiSoft: '#F5F3FF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 10, lg: 14, xl: 20, pill: 9999 },
  font: {
    h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '700' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    label: { fontSize: 13, fontWeight: '600' as const },
    caption: { fontSize: 12, fontWeight: '500' as const },
  },
};

export type Theme = typeof theme;
