/**
 * Upload Screen — Creator upload & Hidden Gem submission
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import { CATEGORIES } from '@/constants/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Mode = 'creator' | 'gem';

export default function UploadScreen() {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState<Mode>('creator');
    const [videoLink, setVideoLink] = useState('');
    const [channelLink, setChannelLink] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [reason, setReason] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Validation states
    const [isChecking, setIsChecking] = useState(false);
    const [subCheck, setSubCheck] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');
    const [dupCheck, setDupCheck] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');

    const submitScale = useSharedValue(1);
    const submitAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: submitScale.value }],
    }));

    const simulateCheck = () => {
        setIsChecking(true);
        setSubCheck('checking');
        setDupCheck('checking');

        setTimeout(() => {
            setSubCheck('pass');
        }, 1200);

        setTimeout(() => {
            setDupCheck('pass');
            setIsChecking(false);
        }, 2000);
    };

    const handleSubmit = () => {
        if (!videoLink) {
            Alert.alert('Missing Info', 'Please enter a video link');
            return;
        }
        if (mode === 'creator' && !channelLink) {
            Alert.alert('Missing Info', 'Please enter your channel link');
            return;
        }
        if (!category) {
            Alert.alert('Missing Info', 'Please select a category');
            return;
        }

        simulateCheck();
        submitScale.value = withSequence(
            withSpring(0.95, { damping: 8 }),
            withSpring(1, Animation.spring)
        );

        setTimeout(() => {
            Alert.alert('✅ Success!', mode === 'creator'
                ? 'Your video has been submitted for review!'
                : 'Thanks for submitting this hidden gem! 💎'
            );
        }, 2500);
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Text style={styles.screenTitle}>Upload</Text>
                <Text style={styles.subtitle}>Share a video with the GemSpots community</Text>

                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                    <Pressable
                        style={[styles.modeBtn, mode === 'creator' && styles.modeBtnActive]}
                        onPress={() => setMode('creator')}
                    >
                        <Ionicons name="videocam" size={18} color={mode === 'creator' ? Colors.white : Colors.textSecondaryDark} />
                        <Text style={[styles.modeText, mode === 'creator' && styles.modeTextActive]}>Upload My Video</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.modeBtn, mode === 'gem' && styles.modeBtnActive]}
                        onPress={() => setMode('gem')}
                    >
                        <Ionicons name="diamond" size={18} color={mode === 'gem' ? Colors.white : Colors.textSecondaryDark} />
                        <Text style={[styles.modeText, mode === 'gem' && styles.modeTextActive]}>Submit Hidden Gem</Text>
                    </Pressable>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Video Link */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="link" size={14} color={Colors.primary} /> Video Link
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="https://youtube.com/watch?v=..."
                            placeholderTextColor={Colors.textMutedDark}
                            value={videoLink}
                            onChangeText={setVideoLink}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Channel Link (Creator only) */}
                    {mode === 'creator' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <Ionicons name="person-circle" size={14} color={Colors.primary} /> Channel Link
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://youtube.com/@yourchannel"
                                placeholderTextColor={Colors.textMutedDark}
                                value={channelLink}
                                onChangeText={setChannelLink}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="grid" size={14} color={Colors.primary} /> Category
                        </Text>
                        <Pressable
                            style={styles.selectBtn}
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <Text style={category ? styles.selectText : styles.selectPlaceholder}>
                                {category || 'Select a category'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color={Colors.textMutedDark} />
                        </Pressable>

                        {showCategoryPicker && (
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <Pressable
                                        key={cat.name}
                                        style={[styles.categoryOption, category === cat.name && styles.categoryOptionActive]}
                                        onPress={() => {
                                            setCategory(cat.name);
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                        <Text style={[styles.categoryName, category === cat.name && styles.categoryNameActive]}>
                                            {cat.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Description / Reason */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="document-text" size={14} color={Colors.primary} />{' '}
                            {mode === 'creator' ? 'Description' : 'Why is this a hidden gem?'}
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={mode === 'creator'
                                ? 'Tell us about your video...'
                                : 'What makes this creator special?'}
                            placeholderTextColor={Colors.textMutedDark}
                            value={mode === 'creator' ? description : reason}
                            onChangeText={mode === 'creator' ? setDescription : setReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Validation Indicators */}
                    {(subCheck !== 'idle' || dupCheck !== 'idle') && (
                        <View style={styles.validationBox}>
                            <ValidationRow
                                label="Subscriber Check (< 5K)"
                                status={subCheck}
                            />
                            <ValidationRow
                                label="Duplicate Check"
                                status={dupCheck}
                            />
                        </View>
                    )}

                    {/* Submit */}
                    <AnimatedPressable
                        style={[styles.submitBtn, Shadows.glow(Colors.primary), submitAnimStyle]}
                        onPress={handleSubmit}
                    >
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            <Ionicons name={mode === 'creator' ? 'cloud-upload' : 'diamond'} size={20} color={Colors.white} />
                            <Text style={styles.submitText}>
                                {isChecking ? 'Verifying...' : mode === 'creator' ? 'Submit Video' : 'Submit Gem'}
                            </Text>
                        </LinearGradient>
                    </AnimatedPressable>
                </View>

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

function ValidationRow({ label, status }: { label: string; status: string }) {
    const iconName = status === 'checking' ? 'time-outline' :
        status === 'pass' ? 'checkmark-circle' :
            status === 'fail' ? 'close-circle' : 'ellipse-outline';
    const iconColor = status === 'checking' ? Colors.accent :
        status === 'pass' ? Colors.success :
            status === 'fail' ? Colors.error : Colors.textMutedDark;

    return (
        <View style={valStyles.row}>
            <Ionicons name={iconName as any} size={18} color={iconColor} />
            <Text style={valStyles.label}>{label}</Text>
            {status === 'checking' && <Text style={valStyles.checking}>Checking...</Text>}
            {status === 'pass' && <Text style={valStyles.pass}>Passed ✓</Text>}
            {status === 'fail' && <Text style={valStyles.fail}>Failed ✗</Text>}
        </View>
    );
}

const valStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
    label: { ...Typography.body, color: Colors.textSecondaryDark, flex: 1 },
    checking: { ...Typography.caption, color: Colors.accent },
    pass: { ...Typography.caption, color: Colors.success },
    fail: { ...Typography.caption, color: Colors.error },
});

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
    },
    screenTitle: {
        ...Typography.screenTitle,
        color: Colors.textPrimaryDark,
        marginTop: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        marginTop: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        padding: Spacing.xs,
        gap: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    modeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.sm,
    },
    modeBtnActive: {
        backgroundColor: Colors.primary,
    },
    modeText: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        fontWeight: '500',
        fontSize: 13,
    },
    modeTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    form: {
        gap: Spacing.md,
    },
    inputGroup: {
        gap: Spacing.sm,
    },
    label: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        ...Typography.body,
        color: Colors.textPrimaryDark,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        height: Layout.inputHeight,
    },
    textArea: {
        height: 100,
        paddingTop: Spacing.sm + 2,
    },
    selectBtn: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        height: Layout.inputHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    selectText: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
    },
    selectPlaceholder: {
        ...Typography.body,
        color: Colors.textMutedDark,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        padding: Spacing.sm,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    categoryOptionActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryEmoji: { fontSize: 14 },
    categoryName: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    categoryNameActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    validationBox: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    submitBtn: {
        borderRadius: Radius.md,
        overflow: 'hidden',
        marginTop: Spacing.sm,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: Layout.buttonHeight + 4,
    },
    submitText: {
        ...Typography.button,
        color: Colors.white,
        fontSize: 16,
    },
});
