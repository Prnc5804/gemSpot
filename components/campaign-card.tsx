/**
 * CampaignCard — Brand deal card with title, budget, deadline, apply CTA
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { Campaign } from '@/constants/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CampaignCardProps {
    campaign: Campaign;
    onPress?: () => void;
    compact?: boolean;
}

export function CampaignCard({ campaign, onPress, compact }: CampaignCardProps) {
    const cardScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    return (
        <AnimatedPressable
            style={[compact ? styles.compactCard : styles.card, Shadows.md, animStyle]}
            onPress={onPress}
            onPressIn={() => { cardScale.value = withSpring(Animation.pressScale, Animation.spring); }}
            onPressOut={() => { cardScale.value = withSpring(1, Animation.spring); }}
        >
            <View style={styles.headerRow}>
                <Image source={{ uri: campaign.brandLogo }} style={styles.brandLogo} />
                <View style={styles.headerInfo}>
                    <Text style={styles.brandName}>{campaign.brandName}</Text>
                    <Text style={styles.title} numberOfLines={2}>{campaign.title}</Text>
                </View>
                <View style={[styles.statusChip, campaign.status === 'active' ? styles.statusActive : styles.statusClosed]}>
                    <Text style={styles.statusText}>{campaign.status === 'active' ? 'Active' : 'Closed'}</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detail}>
                    <Ionicons name="cash-outline" size={14} color={Colors.accent} />
                    <Text style={styles.detailText}>{campaign.budget}</Text>
                </View>
                <View style={styles.detail}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSecondaryDark} />
                    <Text style={styles.detailText}>{campaign.deadline}</Text>
                </View>
                <View style={styles.detail}>
                    <Ionicons name="people-outline" size={14} color={Colors.textSecondaryDark} />
                    <Text style={styles.detailText}>{campaign.applicantsCount}/{campaign.maxCreators}</Text>
                </View>
            </View>

            {!compact && (
                <View style={styles.categoryRow}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{campaign.category}</Text>
                    </View>
                    <Pressable style={styles.applyBtn}>
                        <Text style={styles.applyText}>Apply Now</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                    </Pressable>
                </View>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    compactCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        padding: Spacing.sm + 4,
        width: 260,
        marginRight: Spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    brandLogo: {
        width: 40,
        height: 40,
        borderRadius: Radius.sm,
        backgroundColor: Colors.surfaceDark,
    },
    headerInfo: {
        flex: 1,
    },
    brandName: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
        marginTop: 2,
    },
    statusChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
        alignSelf: 'flex-start',
    },
    statusActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    statusClosed: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    statusText: {
        ...Typography.badge,
        color: Colors.primary,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.sm,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm + 4,
    },
    categoryChip: {
        backgroundColor: Colors.cardDarkElevated,
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
    },
    categoryText: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
    },
    applyText: {
        ...Typography.button,
        color: Colors.white,
        fontSize: 13,
    },
});
