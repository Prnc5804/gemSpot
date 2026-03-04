/**
 * CategoryChip — Emoji + text selectable chip
 */

import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Radius, Typography, Animation } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryChipProps {
    name: string;
    emoji: string;
    isSelected?: boolean;
    onPress?: () => void;
}

export function CategoryChip({ name, emoji, isSelected, onPress }: CategoryChipProps) {
    const chipScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: chipScale.value }],
    }));

    return (
        <AnimatedPressable
            style={[styles.chip, isSelected && styles.chipSelected, animStyle]}
            onPress={onPress}
            onPressIn={() => {
                chipScale.value = withSpring(0.93, Animation.spring);
            }}
            onPressOut={() => {
                chipScale.value = withSpring(1, Animation.spring);
            }}
        >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.text, isSelected && styles.textSelected]}>{name}</Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        backgroundColor: Colors.cardDark,
        borderWidth: 1,
        borderColor: Colors.borderDark,
        marginRight: Spacing.sm,
    },
    chipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    emoji: {
        fontSize: 14,
    },
    text: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        fontSize: 13,
    },
    textSelected: {
        color: Colors.white,
        fontWeight: '600',
    },
});
