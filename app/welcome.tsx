/**
 * Welcome Screen — Onboarding / Landing Page, dark mode support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/theme-context';
import Animated, {
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();

    const bgColor = colors.background;
    const textColor = colors.text;
    const cardBg = isDark ? colors.cardElevated : Colors.white;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: bgColor }]}>
            {/* Header */}
            <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
                <View style={styles.headerIcon}>
                    <Text style={styles.headerIconText}>💎</Text>
                </View>
                <Text style={[styles.headerTitle, { color: textColor }]}>GEMSPOTS</Text>
            </Animated.View>

            {/* Hero Image Area */}
            <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.heroContainer}>
                <View style={[styles.heroImage, { backgroundColor: isDark ? Colors.primary + '30' : Colors.primaryDark }]}>
                    <View style={styles.heroGradient} />
                </View>
            </Animated.View>

            {/* Heading */}
            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.headingSection}>
                <Text style={[styles.heading, { color: textColor }]}>
                    Discover hidden{' '}
                    <Text style={styles.headingAccent}>YouTube</Text>
                    {' '}creators
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    The community uncovering the best emerging creators with under 5,000 subscribers.
                </Text>
            </Animated.View>

            {/* Feature Grid */}
            <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.featureGrid}>
                <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
                    <View style={styles.featureIconBg}>
                        <Ionicons name="people" size={22} color={Colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: textColor }]}>Creators Under 5k Subs</Text>
                </View>
                <View style={[styles.featureCard, { backgroundColor: cardBg }]}>
                    <View style={styles.featureIconBg}>
                        <Ionicons name="thumbs-up" size={22} color={Colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: textColor }]}>Community Voted Gems</Text>
                </View>
            </Animated.View>

            {/* CTA Buttons */}
            <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.ctaSection}>
                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => router.push('/auth/signup' as any)}
                >
                    <Text style={styles.primaryBtnText}>Get Started</Text>
                </Pressable>

                <Pressable
                    style={[styles.secondaryBtn, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.5)',
                        borderColor: isDark ? colors.border : Colors.borderLight,
                    }]}
                    onPress={() => router.push('/auth/login' as any)}
                >
                    <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>I already have an account</Text>
                </Pressable>
            </Animated.View>

            {/* Footer decoration */}
            <View style={styles.footerDot} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs,
    },
    headerIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    headerIconText: { fontSize: 20 },
    headerTitle: {
        fontSize: 13, fontFamily: 'Inter_700Bold', fontWeight: '700',
        letterSpacing: 3, textTransform: 'uppercase',
    },
    heroContainer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
    heroImage: {
        width: '100%', aspectRatio: 4 / 3, borderRadius: Radius.xl,
        overflow: 'hidden', ...Shadows.sm,
    },
    heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primary + '40' },
    headingSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'], alignItems: 'center' },
    heading: {
        fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700',
        textAlign: 'center', letterSpacing: -0.5, lineHeight: 36,
    },
    headingAccent: { color: Colors.primary },
    subtitle: {
        fontSize: 15, fontFamily: 'Inter_400Regular',
        textAlign: 'center', marginTop: Spacing.md, lineHeight: 22, maxWidth: 300, opacity: 0.8,
    },
    featureGrid: {
        flexDirection: 'row', gap: Spacing.md,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl,
    },
    featureCard: {
        flex: 1, aspectRatio: 1, borderRadius: Radius.xl,
        justifyContent: 'center', alignItems: 'center',
        gap: Spacing.sm, padding: Spacing.lg, ...Shadows.apple,
    },
    featureIconBg: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center',
    },
    featureText: {
        fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
        textAlign: 'center', letterSpacing: -0.2,
    },
    ctaSection: {
        paddingHorizontal: Spacing.xl, gap: Spacing.md,
        marginTop: 'auto', paddingBottom: Spacing.xl,
    },
    primaryBtn: {
        backgroundColor: Colors.primary, borderRadius: Radius.md, height: 56,
        justifyContent: 'center', alignItems: 'center', ...Shadows.glow(Colors.primary),
    },
    primaryBtnText: {
        fontSize: 16, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
        color: Colors.white, letterSpacing: -0.2,
    },
    secondaryBtn: {
        borderRadius: Radius.md, height: 56,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1,
    },
    secondaryBtnText: {
        fontSize: 16, fontFamily: 'Inter_500Medium', fontWeight: '500', letterSpacing: -0.2,
    },
    footerDot: {
        width: 48, height: 4, borderRadius: 2,
        backgroundColor: Colors.primary + '30', alignSelf: 'center', marginBottom: Spacing.xl,
    },
});
