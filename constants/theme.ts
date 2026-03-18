/**
 * GemSpots Design System
 * Premium design tokens for a funded-startup quality app
 */

import { Platform } from 'react-native';

// ─── Semantic Color Palette ────────────────────────────────────────────────
export const Colors = {
  // Primary: Lavender for community/discovery
  primary: '#aca0bb',
  primaryLight: '#c4b9d1',
  primaryDark: '#8e7fa3',

  // Accent: Coral for auth/actions
  accent: '#ef8354',
  accentLight: '#f4a27a',
  accentDark: '#d96d3e',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Dark mode (adapted to new palette)
  backgroundDark: '#1a1520',
  surfaceDark: '#2a2233',
  cardDark: '#2a2233',
  cardDarkElevated: '#352d40',
  borderDark: '#3d3548',
  textPrimaryDark: '#F1F5F9',
  textSecondaryDark: '#94A3B8',
  textMutedDark: '#64748B',

  // Light mode (pink-tinted, warm)
  backgroundLight: '#f7ebec',
  surfaceLight: '#FFFFFF',
  cardLight: '#FFFFFF',
  cardLightElevated: '#f3eef4',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  textPrimaryLight: '#1a1a1a',
  textSecondaryLight: '#525252',
  textMutedLight: '#94A3B8',

  // Universal
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#aca0bb', '#8e7fa3'] as const,
  gradientAccent: ['#ef8354', '#d96d3e'] as const,
  gradientDark: ['#1a1520', '#2a2233'] as const,
  gradientCard: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)'] as const,
  gradientGem: ['#aca0bb', '#7b6b8f'] as const,
  gradientFire: ['#EF4444', '#F59E0B'] as const,
  gradientGold: ['#F59E0B', '#EAB308', '#CA8A04'] as const,
  gradientSilver: ['#94A3B8', '#CBD5E1', '#94A3B8'] as const,
  gradientBronze: ['#D97706', '#B45309', '#D97706'] as const,

  // Tab bar (glassmorphism)
  tabBarDark: 'rgba(26, 21, 32, 0.95)',
  tabBarLight: 'rgba(255, 255, 255, 0.80)',
  tabActiveIndicator: '#aca0bb',
};

// ─── Theme Presets (for useColorScheme) ────────────────────────────────────
export const Theme = {
  light: {
    text: Colors.textPrimaryLight,
    textSecondary: Colors.textSecondaryLight,
    textMuted: Colors.textMutedLight,
    background: Colors.backgroundLight,
    surface: Colors.surfaceLight,
    card: Colors.cardLight,
    cardElevated: Colors.cardLightElevated,
    border: Colors.borderLight,
    tint: Colors.primary,
    icon: Colors.textSecondaryLight,
    tabIconDefault: Colors.textMutedLight,
    tabIconSelected: Colors.primary,
    tabBar: Colors.tabBarLight,
  },
  dark: {
    text: Colors.textPrimaryDark,
    textSecondary: Colors.textSecondaryDark,
    textMuted: Colors.textMutedDark,
    background: Colors.backgroundDark,
    surface: Colors.surfaceDark,
    card: Colors.cardDark,
    cardElevated: Colors.cardDarkElevated,
    border: Colors.borderDark,
    tint: Colors.primary,
    icon: Colors.textSecondaryDark,
    tabIconDefault: Colors.textMutedDark,
    tabIconSelected: Colors.primary,
    tabBar: Colors.tabBarDark,
  },
};

// ─── Spacing Scale ─────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ─── Border Radius Tokens ──────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// ─── Typography Scale ──────────────────────────────────────────────────────
export const Typography = {
  screenTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    fontFamily: 'Inter_500Medium',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '300' as const,
    fontFamily: 'Inter_300Light',
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
} as const;

// ─── Shadows (Apple-style soft shadows) ────────────────────────────────────
export const Shadows = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  xl: {
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
  // Apple-style card shadow
  apple: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
  },
  glow: (color: string) => ({
    elevation: 8,
    shadowColor: color,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  }),
};

// ─── Animation Constants ───────────────────────────────────────────────────
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  pressScale: 0.95,
  bounceScale: 1.15,
} as const;

// ─── Layout Constants ──────────────────────────────────────────────────────
export const Layout = {
  sectionSpacing: Spacing.lg,
  sectionPaddingBottom: Spacing.md,
  screenPadding: Spacing.md,
  cardGap: Spacing.sm,
  tabBarHeight: 80,
  headerHeight: 56,
  buttonHeight: 48,
  inputHeight: 48,
  chipHeight: 36,
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  avatarXl: 80,
} as const;

// ─── Fonts (for Expo Font loading) ─────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'serif',
    rounded: 'Inter_400Regular',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Inter', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
