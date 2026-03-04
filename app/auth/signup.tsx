/**
 * Signup Screen — Firebase Auth connected with auto-claim
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Role = 'viewer' | 'creator' | 'brand';

const ROLES: { key: Role; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { key: 'viewer', title: 'Viewer', desc: 'Watch, vote, and discover gems', icon: 'eye', color: Colors.info },
    { key: 'creator', title: 'Creator', desc: 'Upload videos and grow your channel', icon: 'videocam', color: Colors.primary },
    { key: 'brand', title: 'Brand', desc: 'Create campaigns and sponsor creators', icon: 'briefcase', color: Colors.accent },
];

export default function SignupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signUp } = useAuth();
    const [role, setRole] = useState<Role>('viewer');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [channelUrl, setChannelUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const btnScale = useSharedValue(1);
    const btnAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        if (role === 'creator' && !channelUrl.trim()) {
            setError('Please provide your YouTube channel URL');
            return;
        }
        setError('');
        setLoading(true);
        btnScale.value = withSequence(
            withSpring(0.95, { damping: 8 }),
            withSpring(1, Animation.spring)
        );
        try {
            await signUp(
                email.trim(),
                password,
                name.trim(),
                role,
                role === 'creator' ? channelUrl.trim() : undefined
            );
            router.replace('/(tabs)');
        } catch (e: any) {
            setError(e.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                    </Pressable>
                </View>

                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the GemSpots community 💎</Text>

                {/* Role Selection */}
                <Text style={styles.sectionLabel}>I am a...</Text>
                <View style={styles.roleRow}>
                    {ROLES.map((r) => (
                        <Pressable
                            key={r.key}
                            style={[styles.roleCard, role === r.key && styles.roleCardActive, role === r.key && { borderColor: r.color }]}
                            onPress={() => setRole(r.key)}
                        >
                            <View style={[styles.roleIcon, { backgroundColor: r.color + '20' }]}>
                                <Ionicons name={r.icon} size={22} color={r.color} />
                            </View>
                            <Text style={[styles.roleTitle, role === r.key && { color: r.color }]}>{r.title}</Text>
                            <Text style={styles.roleDesc}>{r.desc}</Text>
                            {role === r.key && (
                                <View style={[styles.roleCheck, { backgroundColor: r.color }]}>
                                    <Ionicons name="checkmark" size={12} color={Colors.white} />
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={18} color={Colors.textMutedDark} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full name"
                            placeholderTextColor={Colors.textMutedDark}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={18} color={Colors.textMutedDark} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor={Colors.textMutedDark}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={18} color={Colors.textMutedDark} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.textMutedDark}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {role === 'creator' && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="logo-youtube" size={18} color={Colors.error} />
                            <TextInput
                                style={styles.input}
                                placeholder="YouTube channel URL"
                                placeholderTextColor={Colors.textMutedDark}
                                value={channelUrl}
                                onChangeText={setChannelUrl}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <AnimatedPressable style={[styles.signupBtn, btnAnimStyle]} onPress={handleSignup}>
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.signupGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Text style={styles.signupText}>Create Account</Text>
                                    <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                                </>
                            )}
                        </LinearGradient>
                    </AnimatedPressable>
                </View>

                {/* Login Link */}
                <View style={styles.loginRow}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <Pressable onPress={() => router.push('/auth/login')}>
                        <Text style={styles.loginLink}>Sign In</Text>
                    </Pressable>
                </View>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.backgroundDark },
    scrollContent: { paddingHorizontal: Layout.screenPadding + Spacing.sm },
    headerRow: { marginBottom: Spacing.md },
    closeBtn: { width: 40, height: 40, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    title: { ...Typography.screenTitle, color: Colors.textPrimaryDark, fontSize: 28 },
    subtitle: { ...Typography.body, color: Colors.textSecondaryDark, marginTop: Spacing.xs, marginBottom: Spacing.lg },
    sectionLabel: { ...Typography.cardTitle, color: Colors.textPrimaryDark, marginBottom: Spacing.sm },
    roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    roleCard: {
        flex: 1, backgroundColor: Colors.cardDark, borderRadius: Radius.lg,
        padding: Spacing.sm + 4, alignItems: 'center', gap: 6,
        borderWidth: 1.5, borderColor: Colors.borderDark, position: 'relative',
    },
    roleCardActive: { backgroundColor: Colors.cardDarkElevated },
    roleIcon: {
        width: 44, height: 44, borderRadius: Radius.full,
        justifyContent: 'center', alignItems: 'center',
    },
    roleTitle: { ...Typography.cardTitle, color: Colors.textPrimaryDark, fontSize: 14 },
    roleDesc: { ...Typography.caption, color: Colors.textMutedDark, textAlign: 'center', fontSize: 10 },
    roleCheck: {
        position: 'absolute', top: 6, right: 6,
        width: 20, height: 20, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    form: { gap: Spacing.md },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.cardDark, borderRadius: Radius.md,
        paddingHorizontal: Spacing.md, height: Layout.inputHeight + 4,
        borderWidth: 1, borderColor: Colors.borderDark,
    },
    input: { flex: 1, ...Typography.body, color: Colors.textPrimaryDark },
    signupBtn: { borderRadius: Radius.md, overflow: 'hidden', ...Shadows.glow(Colors.primary), marginTop: Spacing.sm },
    signupGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, height: Layout.buttonHeight + 4,
    },
    signupText: { ...Typography.button, color: Colors.white, fontSize: 16 },
    errorText: { ...Typography.caption, color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
    loginText: { ...Typography.body, color: Colors.textSecondaryDark },
    loginLink: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
});
