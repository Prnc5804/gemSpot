/**
 * Creator Dashboard — Stats, chart, uploads, boosts, brand deals
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { MOCK_VIDEOS, MOCK_DASHBOARD_STATS, MOCK_CAMPAIGNS } from '@/constants/mock-data';
import { StatCard } from '@/components/stat-card';
import { VideoCard } from '@/components/video-card';
import { CampaignCard } from '@/components/campaign-card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreatorDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const stats = MOCK_DASHBOARD_STATS;
    const myVideos = MOCK_VIDEOS.slice(0, 4);

    const maxVal = Math.max(...stats.weeklyGrowth);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Creator Dashboard</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Overview */}
                <View style={styles.statsGrid}>
                    <StatCard icon="chevron-up-circle" value={stats.totalVotes} label="Total Votes" color={Colors.primary} />
                    <StatCard icon="eye" value={stats.totalViews} label="Platform Views" color={Colors.info} />
                    <StatCard icon="trophy" value={`#${stats.currentRank}`} label="Current Rank" color={Colors.accent} />
                    <StatCard icon="videocam" value={stats.videosUploaded} label="Videos" color={Colors.primaryLight} />
                </View>

                {/* Growth Chart */}
                <View style={[styles.chartCard, Shadows.md]}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={styles.chartTitle}>📊 Growth</Text>
                            <View style={styles.growthBadge}>
                                <Ionicons name="trending-up" size={14} color={Colors.success} />
                                <Text style={styles.growthBadgeText}>+12% this week</Text>
                            </View>
                        </View>
                        <View style={styles.chartToggle}>
                            <Pressable
                                style={[styles.chartToggleBtn, chartPeriod === 'weekly' && styles.chartToggleActive]}
                                onPress={() => setChartPeriod('weekly')}
                            >
                                <Text style={[styles.chartToggleText, chartPeriod === 'weekly' && styles.chartToggleTextActive]}>W</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.chartToggleBtn, chartPeriod === 'monthly' && styles.chartToggleActive]}
                                onPress={() => setChartPeriod('monthly')}
                            >
                                <Text style={[styles.chartToggleText, chartPeriod === 'monthly' && styles.chartToggleTextActive]}>M</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Simple bar chart */}
                    <View style={styles.chartBars}>
                        {stats.weeklyGrowth.map((val, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={styles.barWrapper}>
                                    <LinearGradient
                                        colors={Colors.gradientPrimary}
                                        style={[styles.bar, { height: `${(val / maxVal) * 100}%` }]}
                                    />
                                </View>
                                <Text style={styles.barLabel}>{stats.weeklyLabels[i]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Boost Options */}
                <Text style={styles.sectionTitle}>🚀 Boost Your Reach</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boostRow}>
                    {[
                        { name: 'Featured Spot', price: '$4.99', icon: 'star', color: Colors.accent, desc: '24hr featured placement' },
                        { name: 'Trending Push', price: '$2.99', icon: 'trending-up', color: Colors.primary, desc: 'Boost in trending feed' },
                        { name: 'Verified Badge', price: '$9.99', icon: 'checkmark-circle', color: Colors.info, desc: 'Get verified creator badge' },
                    ].map((boost) => (
                        <Pressable key={boost.name} style={[styles.boostCard, Shadows.md]}>
                            <View style={[styles.boostIcon, { backgroundColor: boost.color + '20' }]}>
                                <Ionicons name={boost.icon as any} size={24} color={boost.color} />
                            </View>
                            <Text style={styles.boostName}>{boost.name}</Text>
                            <Text style={styles.boostDesc}>{boost.desc}</Text>
                            <View style={styles.boostPrice}>
                                <Text style={styles.boostPriceText}>{boost.price}</Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* My Videos */}
                <Text style={styles.sectionTitle}>📹 My Videos</Text>
                {myVideos.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        horizontal
                        onPress={() => router.push(`/video/${video.id}` as any)}
                    />
                ))}

                {/* Applied Brand Deals */}
                <Text style={styles.sectionTitle}>🤝 Applied Deals</Text>
                {MOCK_CAMPAIGNS.slice(0, 2).map((campaign) => (
                    <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onPress={() => router.push('/brand-deals')}
                    />
                ))}

                <View style={{ height: Spacing.xl }} />
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
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
    },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    chartCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    chartTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
    },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    growthBadgeText: {
        ...Typography.caption,
        color: Colors.success,
        fontWeight: '600',
    },
    chartToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceDark,
        borderRadius: Radius.full,
        padding: 2,
    },
    chartToggleBtn: {
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.xs + 2,
        borderRadius: Radius.full,
    },
    chartToggleActive: {
        backgroundColor: Colors.primary,
    },
    chartToggleText: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        fontWeight: '600',
    },
    chartToggleTextActive: {
        color: Colors.white,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        gap: Spacing.sm,
    },
    barCol: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
    },
    barWrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        borderRadius: Radius.sm,
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: Radius.sm,
        minHeight: 4,
    },
    barLabel: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        marginTop: Spacing.xs,
        fontSize: 10,
    },
    sectionTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    boostRow: {
        gap: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    boostCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        width: 160,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    boostIcon: {
        width: 48,
        height: 48,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boostName: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
        textAlign: 'center',
        fontSize: 14,
    },
    boostDesc: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        textAlign: 'center',
    },
    boostPrice: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderRadius: Radius.full,
    },
    boostPriceText: {
        ...Typography.button,
        color: Colors.white,
        fontSize: 13,
    },
});
