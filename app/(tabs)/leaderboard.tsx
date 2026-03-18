/**
 * Leaderboard Screen — Podium top 3 + ranked list, Weekly/Monthly toggle
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Layout, Shadows } from '@/constants/theme';
import { MOCK_CREATORS } from '@/constants/mock-data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/theme-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'creators' | 'videos';
type Period = 'weekly' | 'monthly';

export default function LeaderboardScreen() {
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('creators');
    const [period, setPeriod] = useState<Period>('weekly');

    const topThree = MOCK_CREATORS.slice(0, 3);
    const rest = MOCK_CREATORS.slice(3);

    // Podium order: [#2, #1, #3]
    const second = topThree[1];
    const first = topThree[0];
    const third = topThree[2];

    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';

    return (
        <View style={[s.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>

            {/* ═══ HEADER ═══ */}
            <View style={s.header}>
                <View style={s.headerLeft}>
                    <Text style={s.headerEmoji}>🏆</Text>
                    <Text style={[s.headerTitle, { color: colors.text }]}>Leaderboard</Text>
                </View>
                <Pressable
                    style={[s.periodBadge, { backgroundColor: cardBg, borderColor }]}
                    onPress={() => setPeriod(period === 'weekly' ? 'monthly' : 'weekly')}
                >
                    <Text style={[s.periodBadgeText, { color: colors.textSecondary }]}>
                        {period === 'weekly' ? 'Weekly' : 'Monthly'}
                    </Text>
                </Pressable>
            </View>

            {/* ═══ TAB PILLS ═══ */}
            <View style={s.tabRow}>
                <Pressable
                    style={[s.tab, { backgroundColor: cardBg, borderColor }, activeTab === 'creators' && s.tabActive]}
                    onPress={() => setActiveTab('creators')}
                >
                    <Ionicons name="trophy" size={14} color={activeTab === 'creators' ? Colors.white : colors.textMuted} />
                    <Text style={[s.tabText, { color: colors.textMuted }, activeTab === 'creators' && s.tabTextActive]}>Top Creators</Text>
                </Pressable>
                <Pressable
                    style={[s.tab, { backgroundColor: cardBg, borderColor }, activeTab === 'videos' && s.tabActive]}
                    onPress={() => setActiveTab('videos')}
                >
                    <Ionicons name="play-circle" size={14} color={activeTab === 'videos' ? Colors.white : colors.textMuted} />
                    <Text style={[s.tabText, { color: colors.textMuted }, activeTab === 'videos' && s.tabTextActive]}>Top Videos</Text>
                </Pressable>
            </View>

            {/* ═══ PERIOD TOGGLE ═══ */}
            <View style={s.periodRow}>
                <Pressable
                    style={[s.periodPill, { backgroundColor: isDark ? colors.card : Colors.cardLightElevated }, period === 'weekly' && [s.periodPillActive, { backgroundColor: cardBg }]]}
                    onPress={() => setPeriod('weekly')}
                >
                    <Ionicons name="calendar-outline" size={12} color={period === 'weekly' ? Colors.primary : colors.textMuted} />
                    <Text style={[s.periodPillText, { color: colors.textMuted }, period === 'weekly' && s.periodPillTextActive]}>Weekly</Text>
                </Pressable>
                <Pressable
                    style={[s.periodPill, { backgroundColor: isDark ? colors.card : Colors.cardLightElevated }, period === 'monthly' && [s.periodPillActive, { backgroundColor: cardBg }]]}
                    onPress={() => setPeriod('monthly')}
                >
                    <Ionicons name="calendar-outline" size={12} color={period === 'monthly' ? Colors.primary : colors.textMuted} />
                    <Text style={[s.periodPillText, { color: colors.textMuted }, period === 'monthly' && s.periodPillTextActive]}>Monthly</Text>
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

                {/* ═══ PODIUM ═══ */}
                <View style={s.podium}>
                    {/* #2 — Left */}
                    <View style={[s.podiumCol, s.podiumSide]}>
                        <View style={s.avatarWrap2}>
                            <Image source={{ uri: second?.avatar }} style={s.avatar2} />
                        </View>
                        <Text style={[s.podiumName, { color: colors.textSecondary }]} numberOfLines={1}>{second?.name?.slice(0, 10)}...</Text>
                        <Text style={[s.podiumVotes, { color: colors.textMuted }]}>{second?.totalVotes} votes</Text>
                        {second?.growthPercent > 0 && (
                            <View style={s.growthBadge}>
                                <Ionicons name="trending-up" size={10} color={Colors.primary} />
                                <Text style={s.growthText}>{second.growthPercent}%</Text>
                            </View>
                        )}
                    </View>

                    {/* #1 — Center (biggest) */}
                    <View style={[s.podiumCol, s.podiumCenter]}>
                        <Text style={s.crownEmoji}>👑</Text>
                        <View style={s.avatarWrap1}>
                            <Image source={{ uri: first?.avatar }} style={s.avatar1} />
                        </View>
                        <Text style={[s.podiumNameFirst, { color: colors.text }]} numberOfLines={1}>{first?.name}</Text>
                        <View style={s.votesHighlight}>
                            <Text style={s.votesHighlightText}>{first?.totalVotes} votes</Text>
                        </View>
                        {first?.growthPercent > 0 && (
                            <View style={[s.growthBadge, s.growthBadgeGreen]}>
                                <Ionicons name="trending-up" size={10} color={Colors.white} />
                                <Text style={[s.growthText, { color: Colors.white }]}>{first.growthPercent}%</Text>
                            </View>
                        )}
                    </View>

                    {/* #3 — Right */}
                    <View style={[s.podiumCol, s.podiumSide]}>
                        <View style={s.avatarWrap3}>
                            <Image source={{ uri: third?.avatar }} style={s.avatar3} />
                        </View>
                        <Text style={[s.podiumName, { color: colors.textSecondary }]} numberOfLines={1}>{third?.name?.slice(0, 10)}</Text>
                        <Text style={[s.podiumVotes, { color: colors.textMuted }]}>{third?.totalVotes} votes</Text>
                        {third?.growthPercent > 0 && (
                            <View style={s.growthBadge}>
                                <Ionicons name="trending-up" size={10} color={Colors.primary} />
                                <Text style={s.growthText}>{third.growthPercent}%</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ═══ RANKED LIST (#4+) ═══ */}
                {rest.map((creator, index) => (
                    <View key={creator.id} style={[s.rankCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[s.rankNumber, { color: colors.textMuted }]}>#{index + 4}</Text>
                        <Image source={{ uri: creator.avatar }} style={[s.rankAvatar, { borderColor }]} />
                        <View style={s.rankInfo}>
                            <Text style={[s.rankName, { color: colors.text }]} numberOfLines={1}>{creator.name}</Text>
                            <Text style={[s.rankSubs, { color: colors.textSecondary }]}>{creator.subscriberCount} subs</Text>
                        </View>
                        <View style={s.rankRight}>
                            <View style={s.rankVoteBadge}>
                                <Ionicons name="chevron-up" size={14} color={Colors.primary} />
                                <Text style={s.rankVoteText}>{creator.totalVotes}</Text>
                            </View>
                            {creator.growthPercent > 0 && (
                                <View style={s.rankGrowth}>
                                    <Ionicons name="trending-up" size={10} color={Colors.primary} />
                                    <Text style={s.rankGrowthText}>{creator.growthPercent}%</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },

    // ─── Header ───
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: Spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerEmoji: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Inter_800ExtraBold',
        fontWeight: '800',
        color: Colors.textPrimaryLight,
    },
    periodBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    periodBadgeText: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textSecondaryLight,
    },

    // ─── Tabs ───
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: Layout.screenPadding,
        gap: 10,
        paddingBottom: Spacing.sm,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: Radius.full,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    tabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textMutedLight,
    },
    tabTextActive: {
        color: Colors.white,
    },

    // ─── Period Toggle ───
    periodRow: {
        flexDirection: 'row',
        paddingHorizontal: Layout.screenPadding,
        gap: 8,
        paddingBottom: Spacing.sm,
    },
    periodPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.cardLightElevated,
    },
    periodPillActive: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    periodPillText: {
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textMutedLight,
    },
    periodPillTextActive: {
        color: Colors.primary,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
    },

    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
    },

    // ─── Podium ───
    podium: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingTop: 24,
        paddingBottom: 20,
    },
    podiumCol: {
        alignItems: 'center',
        flex: 1,
    },
    podiumSide: {
        paddingTop: 20,
    },
    podiumCenter: {
        marginTop: -10,
    },

    // #1 avatar
    crownEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    avatarWrap1: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#F59E0B',
        overflow: 'hidden',
        marginBottom: 8,
        ...Shadows.apple,
    },
    avatar1: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.cardLightElevated,
    },
    podiumNameFirst: {
        fontSize: 15,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
        textAlign: 'center',
    },
    votesHighlight: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: Radius.full,
        marginTop: 4,
    },
    votesHighlightText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F59E0B',
    },

    // #2 avatar
    avatarWrap2: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2.5,
        borderColor: '#94A3B8',
        overflow: 'hidden',
        marginBottom: 6,
        ...Shadows.apple,
    },
    avatar2: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.cardLightElevated,
    },

    // #3 avatar
    avatarWrap3: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2.5,
        borderColor: '#D97706',
        overflow: 'hidden',
        marginBottom: 6,
        ...Shadows.apple,
    },
    avatar3: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.cardLightElevated,
    },

    podiumName: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textSecondaryLight,
        textAlign: 'center',
        width: 85,
    },
    podiumVotes: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: Colors.textMutedLight,
        marginTop: 2,
    },

    // Growth badges
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        marginTop: 4,
    },
    growthBadgeGreen: {
        backgroundColor: Colors.primary,
    },
    growthText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primary,
    },

    // ─── Ranked List ───
    rankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        gap: 12,
        ...Shadows.sm,
    },
    rankNumber: {
        fontSize: 16,
        fontFamily: 'Inter_800ExtraBold',
        fontWeight: '800',
        color: Colors.textMutedLight,
        width: 28,
    },
    rankAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.cardLightElevated,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    rankInfo: {
        flex: 1,
    },
    rankName: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
    },
    rankSubs: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondaryLight,
        marginTop: 2,
    },
    rankRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    rankVoteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary + '15',
    },
    rankVoteText: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.primary,
    },
    rankGrowth: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    rankGrowthText: {
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.primary,
    },
});
