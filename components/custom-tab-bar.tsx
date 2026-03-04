/**
 * CustomTabBar — Rounded tab bar with floating center FAB and active glow
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation, Layout } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
    index: { active: 'home', inactive: 'home-outline' },
    explore: { active: 'compass', inactive: 'compass-outline' },
    upload: { active: 'add-circle', inactive: 'add-circle-outline' },
    leaderboard: { active: 'trophy', inactive: 'trophy-outline' },
    profile: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
    index: 'Home',
    explore: 'Discover',
    upload: 'Upload',
    leaderboard: 'Ranks',
    profile: 'Profile',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.wrapper}>
            <View style={[styles.container, Shadows.xl]}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const isUpload = route.name === 'upload';
                    const icons = TAB_ICONS[route.name] || { active: 'help-circle', inactive: 'help-circle-outline' };
                    const label = TAB_LABELS[route.name] || route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    if (isUpload) {
                        return (
                            <UploadFAB key={route.key} isFocused={isFocused} onPress={onPress} />
                        );
                    }

                    return (
                        <TabItem
                            key={route.key}
                            label={label}
                            iconName={isFocused ? icons.active : icons.inactive}
                            isFocused={isFocused}
                            onPress={onPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}

function TabItem({ label, iconName, isFocused, onPress }: {
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    isFocused: boolean;
    onPress: () => void;
}) {
    const tabScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: tabScale.value }],
    }));

    return (
        <AnimatedPressable
            style={[styles.tab, animStyle]}
            onPress={onPress}
            onPressIn={() => { tabScale.value = withSpring(0.9, Animation.spring); }}
            onPressOut={() => { tabScale.value = withSpring(1, Animation.spring); }}
        >
            <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? Colors.primary : Colors.textMutedDark}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label}
            </Text>
            {isFocused && <View style={styles.activeIndicator} />}
        </AnimatedPressable>
    );
}

function UploadFAB({ isFocused, onPress }: { isFocused: boolean; onPress: () => void }) {
    const fabScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: fabScale.value }],
    }));

    return (
        <AnimatedPressable
            style={[styles.fabWrapper, animStyle]}
            onPress={onPress}
            onPressIn={() => { fabScale.value = withSpring(0.88, Animation.spring); }}
            onPressOut={() => { fabScale.value = withSpring(1, Animation.spring); }}
        >
            <View style={[styles.fab, Shadows.glow(Colors.primary)]}>
                <Ionicons name="add" size={28} color={Colors.white} />
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.tabBarDark,
        borderRadius: Radius.xl,
        height: 64,
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        position: 'relative',
    },
    label: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        marginTop: 2,
        fontSize: 10,
    },
    labelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
    },
    fabWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -28,
    },
    fab: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
