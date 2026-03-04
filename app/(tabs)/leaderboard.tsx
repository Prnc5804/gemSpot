/**
 * Leaderboard Screen — Rankings with medals, animated numbers, and tabs
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import { MOCK_CREATORS, MOCK_LEADERBOARD } from '@/constants/mock-data';
import { CreatorCard } from '@/components/creator-card';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LeaderboardTab = 'creators' | 'videos' | 'growing' | 'scouts';

const TABS: { key: LeaderboardTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'creators', label: 'Top Creators', icon: 'star' },
    { key: 'videos', label: 'Top Videos', icon: 'play-circle' },
    { key: 'growing', label: 'Fastest Growing', icon: 'trending-up' },
    { key: 'scouts', label: 'Talent Scouts', icon: 'telescope' },
];

const MEDAL_COLORS = [Colors.gradientGold, Colors.gradientSilver, Colors.gradientBronze];
const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<LeaderboardTab>('creators');
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

    const topThree = MOCK_CREATORS.slice(0, 3);
    const rest = MOCK_CREATORS.slice(3);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.screenTitle}>🏆 Leaderboard</Text>
                <View style={styles.periodToggle}>
                    <Pressable
                        style={[styles.periodBtn, period === 'weekly' && styles.periodActive]}
                        onPress={() => setPeriod('weekly')}
                    >
                        <Text style={[styles.periodText, period === 'weekly' && styles.periodTextActive]}>Weekly</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.periodBtn, period === 'monthly' && styles.periodActive]}
                        onPress={() => setPeriod('monthly')}
                    >
                        <Text style={[styles.periodText, period === 'monthly' && styles.periodTextActive]}>Monthly</Text>
                    </Pressable>
                </View>
            </View>

            {/* Tab Switcher */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabRow}
            >
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={16}
                            color={activeTab === tab.key ? Colors.white : Colors.textMutedDark}
                        />
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Top 3 Podium */}
                <View style={styles.podium}>
                    {/* 2nd Place */}
                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumAvWrapper, styles.podiumSecond]}>
                            <Image source={{ uri: topThree[1]?.avatar }} style={[styles.podiumAvatar, styles.podiumAvatarSm]} />
                            <View style={styles.medalBadge}>
                                <Text style={styles.medalEmoji}>{MEDAL_EMOJIS[1]}</Text>
                            </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{topThree[1]?.name}</Text>
                        <Text style={styles.podiumStat}>{topThree[1]?.totalVotes} votes</Text>
                    </View>

                    {/* 1st Place (larger, center) */}
                    <View style={[styles.podiumItem, styles.podiumFirst]}>
                        <View style={[styles.podiumAvWrapper, styles.podiumFirstAv]}>
                            <LinearGradient
                                colors={Colors.gradientGold as any}
                                style={styles.crownGlow}
                            >
                                <Text style={styles.crownEmoji}>👑</Text>
                            </LinearGradient>
                            <Image source={{ uri: topThree[0]?.avatar }} style={styles.podiumAvatar} />
                            <View style={styles.medalBadge}>
                                <Text style={styles.medalEmoji}>{MEDAL_EMOJIS[0]}</Text>
                            </View>
                        </View>
                        <Text style={styles.podiumNameFirst} numberOfLines={1}>{topThree[0]?.name}</Text>
                        <Text style={styles.podiumStatFirst}>{topThree[0]?.totalVotes} votes</Text>
                        <View style={styles.growthPill}>
                            <Ionicons name="trending-up" size={12} color={Colors.white} />
                            <Text style={styles.growthPillText}>+{topThree[0]?.growthPercent}%</Text>
                        </View>
                    </View>

                    {/* 3rd Place */}
                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumAvWrapper, styles.podiumThird]}>
                            <Image source={{ uri: topThree[2]?.avatar }} style={[styles.podiumAvatar, styles.podiumAvatarSm]} />
                            <View style={styles.medalBadge}>
                                <Text style={styles.medalEmoji}>{MEDAL_EMOJIS[2]}</Text>
                            </View>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{topThree[2]?.name}</Text>
                        <Text style={styles.podiumStat}>{topThree[2]?.totalVotes} votes</Text>
                    </View>
                </View>

                {/* Rest of Rankings */}
                <View style={styles.rankList}>
                    {rest.map((creator, index) => (
                        <CreatorCard
                            key={creator.id}
                            creator={{ ...creator, rank: index + 4 }}
                            variant="full"
                        />
                    ))}
                </View>

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: Spacing.sm,
    },
    screenTitle: {
        ...Typography.screenTitle,
        color: Colors.textPrimaryDark,
    },
    periodToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.full,
        padding: 3,
    },
    periodBtn: {
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.xs + 2,
        borderRadius: Radius.full,
    },
    periodActive: {
        backgroundColor: Colors.primary,
    },
    periodText: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        fontWeight: '500',
    },
    periodTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    tabRow: {
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        backgroundColor: Colors.cardDark,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    tabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabText: {
        ...Typography.body,
        color: Colors.textMutedDark,
        fontSize: 13,
    },
    tabTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
    },
    podium: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingVertical: Spacing.lg,
        gap: Spacing.md,
    },
    podiumItem: {
        alignItems: 'center',
        flex: 1,
    },
    podiumFirst: {
        marginBottom: Spacing.md,
    },
    podiumAvWrapper: {
        position: 'relative',
        marginBottom: Spacing.sm,
    },
    podiumFirstAv: {},
    podiumSecond: {},
    podiumThird: {},
    podiumAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: Colors.accent,
        backgroundColor: Colors.surfaceDark,
    },
    podiumAvatarSm: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
    },
    crownGlow: {
        position: 'absolute',
        top: -20,
        alignSelf: 'center',
        width: 30,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        left: '50%',
        marginLeft: -15,
    },
    crownEmoji: {
        fontSize: 16,
    },
    medalBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: Colors.backgroundDark,
        borderRadius: Radius.full,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    medalEmoji: {
        fontSize: 14,
    },
    podiumName: {
        ...Typography.caption,
        color: Colors.textPrimaryDark,
        fontWeight: '600',
        textAlign: 'center',
        width: 80,
    },
    podiumNameFirst: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
        textAlign: 'center',
    },
    podiumStat: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        marginTop: 2,
    },
    podiumStatFirst: {
        ...Typography.body,
        color: Colors.accent,
        fontWeight: '600',
        marginTop: 2,
    },
    growthPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
        marginTop: Spacing.xs,
    },
    growthPillText: {
        ...Typography.badge,
        color: Colors.white,
        fontSize: 10,
    },
    rankList: {
        marginTop: Spacing.md,
    },
});
