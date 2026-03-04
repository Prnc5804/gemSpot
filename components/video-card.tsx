/**
 * VideoCard — Thumbnail card with play overlay, info, and upvote button
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { Video } from '@/constants/types';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface VideoCardProps {
    video: Video;
    onPress?: () => void;
    onVote?: () => void;
    compact?: boolean;
    horizontal?: boolean;
}

export function VideoCard({ video, onPress, onVote, compact, horizontal }: VideoCardProps) {
    const [voted, setVoted] = useState(false);
    const [localVotes, setLocalVotes] = useState(video.voteCount);
    const cardScale = useSharedValue(1);
    const voteScale = useSharedValue(1);

    const cardAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const voteAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: voteScale.value }],
    }));

    const handlePressIn = () => {
        cardScale.value = withSpring(Animation.pressScale, Animation.spring);
    };

    const handlePressOut = () => {
        cardScale.value = withSpring(1, Animation.spring);
    };

    const handleVote = () => {
        if (!voted) {
            setVoted(true);
            setLocalVotes((v) => v + 1);
            voteScale.value = withSequence(
                withSpring(Animation.bounceScale, { damping: 8, stiffness: 200 }),
                withSpring(1, Animation.spring)
            );
        }
        onVote?.();
    };

    if (horizontal) {
        return (
            <AnimatedPressable
                style={[styles.horizontalCard, Shadows.md, cardAnimStyle]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Image source={{ uri: video.thumbnailUrl }} style={styles.horizontalThumb} />
                <View style={styles.horizontalInfo}>
                    <Text style={styles.horizontalTitle} numberOfLines={2}>{video.title}</Text>
                    <Text style={styles.channelName}>{video.creatorName}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statText}>{formatCount(video.subscriberCount)} subs</Text>
                        <View style={styles.dot} />
                        <Ionicons name="chevron-up" size={14} color={voted ? Colors.primary : Colors.textSecondaryDark} />
                        <Text style={[styles.statText, voted && styles.votedText]}>{formatCount(localVotes)}</Text>
                    </View>
                </View>
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            style={[compact ? styles.compactCard : styles.card, Shadows.md, cardAnimStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={styles.thumbContainer}>
                <Image source={{ uri: video.thumbnailUrl }} style={compact ? styles.compactThumb : styles.thumbnail} />
                <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={compact ? 32 : 44} color="rgba(255,255,255,0.9)" />
                </View>
                {video.isTrending && (
                    <View style={styles.trendingBadge}>
                        <Text style={styles.badgeText}>🔥 Trending</Text>
                    </View>
                )}
                {video.isGemOfDay && (
                    <View style={[styles.trendingBadge, styles.gemBadge]}>
                        <Text style={styles.badgeText}>💎 Gem</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                    <Image source={{ uri: video.creatorAvatar }} style={styles.avatar} />
                    <View style={styles.titleCol}>
                        <Text style={compact ? styles.compactTitle : styles.title} numberOfLines={2}>{video.title}</Text>
                        <Text style={styles.channelName}>{video.creatorName} · {formatCount(video.subscriberCount)} subs</Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{video.category}</Text>
                    </View>
                    <AnimatedPressable style={[styles.voteBtn, voted && styles.voteBtnActive, voteAnimStyle]} onPress={handleVote}>
                        <Ionicons name={voted ? 'chevron-up' : 'chevron-up-outline'} size={16} color={voted ? Colors.white : Colors.primary} />
                        <Text style={[styles.voteCount, voted && styles.voteCountActive]}>{formatCount(localVotes)}</Text>
                    </AnimatedPressable>
                </View>
            </View>
        </AnimatedPressable>
    );
}

function formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    compactCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        overflow: 'hidden',
        width: 200,
        marginRight: Spacing.sm,
    },
    horizontalCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    thumbContainer: { position: 'relative' },
    thumbnail: {
        width: '100%',
        height: 200,
        backgroundColor: Colors.surfaceDark,
    },
    compactThumb: {
        width: 200,
        height: 112,
        backgroundColor: Colors.surfaceDark,
    },
    horizontalThumb: {
        width: 120,
        height: 80,
        backgroundColor: Colors.surfaceDark,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    trendingBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    gemBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        left: undefined,
        right: Spacing.sm,
    },
    badgeText: {
        ...Typography.badge,
        color: Colors.white,
    },
    infoContainer: {
        padding: Spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    titleCol: {
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceDark,
    },
    title: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
    },
    compactTitle: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
    },
    channelName: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        marginTop: 2,
    },
    horizontalInfo: {
        flex: 1,
        padding: Spacing.sm,
        justifyContent: 'center',
    },
    horizontalTitle: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    statText: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    votedText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.textMutedDark,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    categoryChip: {
        backgroundColor: Colors.cardDarkElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    categoryText: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    voteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    voteBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    voteCount: {
        ...Typography.badge,
        color: Colors.primary,
    },
    voteCountActive: {
        color: Colors.white,
    },
});
