// NewsLens AI Design Tokens & Color Palette

export const COLORS = {
  // Brand & Background
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceDark: '#0F172A',
  surfaceCard: '#FFFFFF',

  // Primary Editorial Brand Colors
  primary: '#1E3A8A', // Deep Academic Navy
  primaryLight: '#3B82F6',
  primaryDark: '#0F172A',
  primaryMuted: '#EFF6FF',

  // Accents & Framing Semantics
  accent: '#2563EB',
  accentSubtle: '#DBEAFE',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Sentiment & Framing Indicators
  neutral: '#64748B',
  neutralLight: '#F1F5F9',
  positive: '#059669', // Emerald
  positiveLight: '#ECFDF5',
  warning: '#D97706',  // Amber
  warningLight: '#FFFBEB',
  negative: '#DC2626', // Crimson
  negativeLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',

  // Typography Colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textInverseMuted: '#94A3B8',

  // Framing Dimension Badges
  frameConflict: '#7C3AED',
  frameConflictLight: '#F5F3FF',
  frameEconomic: '#0284C7',
  frameEconomicLight: '#F0F9FF',
  frameHumanInterest: '#D97706',
  frameHumanInterestLight: '#FFFBEB',
  frameMorality: '#059669',
  frameMoralityLight: '#ECFDF5',
  frameResponsibility: '#EA580C',
  frameResponsibilityLight: '#FFF7ED',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
};
