/**
 * Creator Profile Screen — Shows claimed vs unclaimed creator info
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { VideoCard } from '@/components/video-card';
import { UnclaimedBadge } from '@/components/unclaimed-badge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_VIDEOS, MOCK_CREATORS } from '@/constants/mock-data';

export default function CreatorProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // In production, fetch from Firestore using getCreatorById(id)
    // For now, use mock data
    const creator = MOCK_CREATORS.find((c) => c.id === id) || {
        id: id || '0',
        name: 'Unknown Creator',
        avatar: 'https://ui-avatars.com/api/?name=UC&background=10B981&color=fff&size=128',
        channelUrl: '',
        channelId: '',
        subscriberCount: 420,
        claimed: false,
        userId: null,
        totalVotes: 85,
        totalViews: 1200,
        rank: 12,
        growthPercent: 15,
        isVerified: false,
        joinedAt: '2025-01-15',
        videosCount: 3,
        badges: [],
        level: 1,
        xp: 0,
        xpToNext: 100,
    };

    // Check if creator is claimed — mock: first 3 are claimed
    const isClaimed = MOCK_CREATORS.indexOf(creator as any) < 3;
    const creatorVideos = MOCK_VIDEOS.filter((v) => v.creatorId === creator.id).slice(0, 6);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header with back button */}
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Creator Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Avatar + Name + Stats */}
                <View style={styles.profileCard}>
                    <Image source={{ uri: creator.avatar }} style={styles.avatar} />
                    <Text style={styles.creatorName}>{creator.name}</Text>
                    <View style={styles.subsRow}>
                        <Ionicons name="people" size={14} color={Colors.textMutedDark} />
                        <Text style={styles.subsText}>{creator.subscriberCount.toLocaleString()} subscribers</Text>
                    </View>

                    {/* Claimed / Unclaimed Status */}
                    {isClaimed ? (
                        <View style={styles.claimedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                            <Text style={styles.claimedText}>Verified Creator</Text>
                        </View>
                    ) : (
                        <UnclaimedBadge creatorName={creator.name} variant="chip" />
                    )}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{creator.totalVotes}</Text>
                            <Text style={styles.statLabel}>Votes</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{creator.videosCount}</Text>
                            <Text style={styles.statLabel}>Videos</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>#{creator.rank}</Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: Colors.primary }]}>+{creator.growthPercent}%</Text>
                            <Text style={styles.statLabel}>Growth</Text>
                        </View>
                    </View>
                </View>

                {/* Unclaimed Banner (full) */}
                {!isClaimed && (
                    <View style={styles.bannerContainer}>
                        <UnclaimedBadge creatorName={creator.name} variant="banner" />
                    </View>
                )}

                {/* What unclaimed creators can't do */}
                {!isClaimed && (
                    <View style={styles.restrictionsCard}>
                        <Text style={styles.restrictionsTitle}>Unclaimed creators cannot:</Text>
                        <View style={styles.restrictionItem}>
                            <Ionicons name="close-circle" size={16} color={Colors.error} />
                            <Text style={styles.restrictionText}>Edit profile</Text>
                        </View>
                        <View style={styles.restrictionItem}>
                            <Ionicons name="close-circle" size={16} color={Colors.error} />
                            <Text style={styles.restrictionText}>Apply to brand deals</Text>
                        </View>
                        <View style={styles.restrictionItem}>
                            <Ionicons name="close-circle" size={16} color={Colors.error} />
                            <Text style={styles.restrictionText}>Boost videos</Text>
                        </View>
                        <View style={styles.restrictionItem}>
                            <Ionicons name="close-circle" size={16} color={Colors.error} />
                            <Text style={styles.restrictionText}>Access analytics</Text>
                        </View>
                    </View>
                )}

                {/* Videos by this creator */}
                <Text style={styles.sectionTitle}>Videos</Text>
                {creatorVideos.length > 0 ? (
                    <View style={styles.videoList}>
                        {creatorVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                compact
                                onPress={() => router.push(`/video/${video.id}` as any)}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyVideos}>
                        <Ionicons name="videocam-off-outline" size={40} color={Colors.textMutedDark} />
                        <Text style={styles.emptyText}>No videos submitted yet</Text>
                    </View>
                )}

                <View style={{ height: Spacing.xl * 2 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: Colors.cardDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.screenTitle,
        color: Colors.textPrimaryDark,
        fontSize: 18,
    },
    content: {
        paddingHorizontal: Layout.screenPadding,
    },

    // ── Profile Card ──
    profileCard: {
        alignItems: 'center',
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        ...Shadows.md,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: Colors.primary,
        marginBottom: Spacing.sm,
    },
    creatorName: {
        ...Typography.screenTitle,
        color: Colors.textPrimaryDark,
        fontSize: 22,
        marginBottom: 4,
    },
    subsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.sm,
    },
    subsText: {
        ...Typography.body,
        color: Colors.textMutedDark,
    },
    claimedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: 4,
        borderRadius: Radius.full,
        marginBottom: Spacing.md,
    },
    claimedText: {
        ...Typography.badge,
        color: Colors.primary,
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        fontSize: 18,
        color: Colors.textPrimaryDark,
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.borderDark,
    },

    // ── Unclaimed Banner ──
    bannerContainer: {
        marginBottom: Spacing.md,
    },

    // ── Restrictions Card ──
    restrictionsCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    restrictionsTitle: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
        marginBottom: 4,
    },
    restrictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    restrictionText: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
    },

    // ── Videos Section ──
    sectionTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
        marginBottom: Spacing.sm,
    },
    videoList: {
        gap: Spacing.sm,
    },
    emptyVideos: {
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
        gap: Spacing.sm,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textMutedDark,
    },
});
