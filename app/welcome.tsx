/**
 * Welcome Screen — First screen users see, before login/signup
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Background gradient overlay */}
            <LinearGradient
                colors={['transparent', Colors.backgroundDark]}
                style={StyleSheet.absoluteFill}
            />

            {/* Logo + Tagline */}
            <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.heroSection}>
                <View style={[styles.logoCircle, Shadows.glow(Colors.primary)]}>
                    <Text style={styles.logoEmoji}>💎</Text>
                </View>
                <Text style={styles.appName}>
                    Gem<Text style={styles.appNameAccent}>Spots</Text>
                </Text>
                <Text style={styles.tagline}>Discover hidden YouTube creators</Text>
            </Animated.View>

            {/* Features */}
            <Animated.View entering={FadeInDown.delay(500).duration(800)} style={styles.features}>
                <View style={styles.featureRow}>
                    <View style={styles.featureDot}>
                        <Ionicons name="search" size={16} color={Colors.primary} />
                    </View>
                    <Text style={styles.featureText}>Find creators with under 5K subs</Text>
                </View>
                <View style={styles.featureRow}>
                    <View style={styles.featureDot}>
                        <Ionicons name="thumbs-up" size={16} color={Colors.accent} />
                    </View>
                    <Text style={styles.featureText}>Upvote your favorite hidden gems</Text>
                </View>
                <View style={styles.featureRow}>
                    <View style={styles.featureDot}>
                        <Ionicons name="trending-up" size={16} color={Colors.info} />
                    </View>
                    <Text style={styles.featureText}>Help small creators grow & trend</Text>
                </View>
            </Animated.View>

            {/* CTA Buttons */}
            <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.ctaSection}>
                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => router.push('/auth/signup' as any)}
                >
                    <LinearGradient
                        colors={Colors.gradientPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryBtnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                    </LinearGradient>
                </Pressable>

                <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => router.push('/auth/login' as any)}
                >
                    <Text style={styles.secondaryBtnText}>I already have an account</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },

    // ── Hero ──
    heroSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl + Spacing.lg,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoEmoji: {
        fontSize: 44,
    },
    appName: {
        fontSize: 36,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryDark,
        letterSpacing: -1.5,
    },
    appNameAccent: {
        color: Colors.primary,
    },
    tagline: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        marginTop: Spacing.xs,
        fontSize: 16,
    },

    // ── Features ──
    features: {
        gap: Spacing.md,
        marginBottom: Spacing.xl + Spacing.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + 4,
    },
    featureDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.cardDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        fontSize: 15,
    },

    // ── CTA ──
    ctaSection: {
        gap: Spacing.md,
    },
    primaryBtn: {
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadows.glow(Colors.primary),
    },
    primaryBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: Layout.buttonHeight + 8,
    },
    primaryBtnText: {
        ...Typography.button,
        color: Colors.white,
        fontSize: 17,
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    secondaryBtnText: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        fontSize: 15,
    },
});
