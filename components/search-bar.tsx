/**
 * SearchBar — Animated search input with icon
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Layout } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onFocus?: () => void;
}

export function SearchBar({ placeholder = 'Search creators, videos...', value, onChangeText, onFocus }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const borderOpacity = useSharedValue(0);

    const borderStyle = useAnimatedStyle(() => ({
        borderColor: isFocused ? Colors.primary : Colors.borderDark,
        borderWidth: isFocused ? 1.5 : 1,
    }));

    return (
        <Animated.View style={[styles.container, borderStyle]}>
            <Ionicons name="search" size={18} color={isFocused ? Colors.primary : Colors.textMutedDark} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMutedDark}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => {
                    setIsFocused(true);
                    onFocus?.();
                }}
                onBlur={() => setIsFocused(false)}
            />
            {value && value.length > 0 && (
                <Pressable onPress={() => onChangeText?.('')}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMutedDark} />
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.sm + 4,
        height: Layout.inputHeight,
        gap: Spacing.sm,
        marginHorizontal: Layout.screenPadding,
    },
    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimaryDark,
    },
});
