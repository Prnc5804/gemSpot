/**
 * Login Screen — Firebase Auth connected
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const btnScale = useSharedValue(1);
    const btnAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        btnScale.value = withSequence(
            withSpring(0.95, { damping: 8 }),
            withSpring(1, Animation.spring)
        );
        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)');
        } catch (e: any) {
            setError(e.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                {/* Close */}
                <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={Colors.textPrimaryDark} />
                </Pressable>

                {/* Logo */}
                <View style={styles.logoSection}>
                    <View style={[styles.logoCircle, Shadows.glow(Colors.primary)]}>
                        <Text style={styles.logoEmoji}>💎</Text>
                    </View>
                    <Text style={styles.logoText}>
                        Gem<Text style={styles.logoAccent}>Spots</Text>
                    </Text>
                    <Text style={styles.tagline}>Discover hidden creators</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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
                            secureTextEntry={!showPassword}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMutedDark} />
                        </Pressable>
                    </View>

                    <Pressable style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </Pressable>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <AnimatedPressable style={[styles.loginBtn, btnAnimStyle]} onPress={handleLogin}>
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Text style={styles.loginText}>Sign In</Text>
                                    <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                                </>
                            )}
                        </LinearGradient>
                    </AnimatedPressable>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <View style={styles.socialRow}>
                    <Pressable style={styles.socialBtn}>
                        <Ionicons name="logo-google" size={20} color={Colors.textPrimaryDark} />
                    </Pressable>
                    <Pressable style={styles.socialBtn}>
                        <Ionicons name="logo-apple" size={20} color={Colors.textPrimaryDark} />
                    </Pressable>
                    <Pressable style={styles.socialBtn}>
                        <Ionicons name="logo-github" size={20} color={Colors.textPrimaryDark} />
                    </Pressable>
                </View>

                {/* Sign Up */}
                <View style={styles.signupRow}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <Pressable onPress={() => router.push('/auth/signup')}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.backgroundDark },
    container: { flex: 1, paddingHorizontal: Layout.screenPadding + Spacing.sm, justifyContent: 'center' },
    closeBtn: {
        position: 'absolute', top: Spacing.sm, right: 0,
        width: 40, height: 40, borderRadius: Radius.full,
        justifyContent: 'center', alignItems: 'center',
    },
    logoSection: { alignItems: 'center', marginBottom: Spacing['3xl'] },
    logoCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoEmoji: { fontSize: 32 },
    logoText: {
        fontSize: 30, fontFamily: 'Inter_700Bold', fontWeight: '700',
        color: Colors.textPrimaryDark, letterSpacing: -1,
    },
    logoAccent: { color: Colors.primary },
    tagline: { ...Typography.body, color: Colors.textMutedDark, marginTop: 4 },
    form: { gap: Spacing.md },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.cardDark, borderRadius: Radius.md,
        paddingHorizontal: Spacing.md, height: Layout.inputHeight + 4,
        borderWidth: 1, borderColor: Colors.borderDark,
    },
    input: { flex: 1, ...Typography.body, color: Colors.textPrimaryDark },
    forgotBtn: { alignSelf: 'flex-end' },
    forgotText: { ...Typography.caption, color: Colors.primary },
    loginBtn: { borderRadius: Radius.md, overflow: 'hidden', ...Shadows.glow(Colors.primary) },
    loginGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, height: Layout.buttonHeight + 4,
    },
    loginText: { ...Typography.button, color: Colors.white, fontSize: 16 },
    errorText: { ...Typography.caption, color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
    divider: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        marginVertical: Spacing.lg,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderDark },
    dividerText: { ...Typography.caption, color: Colors.textMutedDark },
    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md },
    socialBtn: {
        width: 52, height: 52, borderRadius: Radius.md,
        backgroundColor: Colors.cardDark, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.borderDark,
    },
    signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
    signupText: { ...Typography.body, color: Colors.textSecondaryDark },
    signupLink: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
});
