/**
 * Creator Dashboard — Real stats from Firestore
 */

import { StatCard } from '@/components/stat-card';
import { VideoCard } from '@/components/video-card';
import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Video } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import * as UserService from '@/services/user-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreatorDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user } = useAuth();
    const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const [loading, setLoading] = useState(true);
    const [myVideos, setMyVideos] = useState<Video[]>([]);
    const [stats, setStats] = useState({
        totalVotes: 0,
        totalViews: 0,
        currentRank: 0,
        videosUploaded: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, [user?.id]);

    const fetchDashboardData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch user's videos
            const videosQ = query(
                collection(db, 'videos'),
                where('submittedBy', '==', user.id),
                orderBy('createdAt', 'desc'),
            );
            const videosSnap = await getDocs(videosQ);
            const videos = videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
            setMyVideos(videos);

            // Calculate stats from real data
            let totalVotes = 0;
            let totalViews = 0;
            videos.forEach((v) => {
                totalVotes += v.voteCount || 0;
                totalViews += v.viewsFromPlatform || 0;
            });

            const rank = await UserService.getUserRank(user.id);

            setStats({
                totalVotes,
                totalViews,
                currentRank: rank > 0 ? rank : 0,
                videosUploaded: videos.length,
            });
        } catch (error) {
            console.log('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Creator Dashboard</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Overview */}
                <View style={styles.statsGrid}>
                    <StatCard icon="chevron-up-circle" value={stats.totalVotes} label="Total Votes" color={Colors.primary} />
                    <StatCard icon="eye" value={stats.totalViews} label="Platform Views" color={Colors.info} />
                    <StatCard icon="trophy" value={stats.currentRank > 0 ? `#${stats.currentRank}` : '-'} label="Current Rank" color={Colors.accent} />
                    <StatCard icon="videocam" value={stats.videosUploaded} label="Videos" color={Colors.primaryLight} />
                </View>

                {/* Boost Options */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🚀 Boost Your Reach</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boostRow}>
                    {[
                        { name: 'Featured Spot', price: '$4.99', icon: 'star', color: Colors.accent, desc: '24hr featured placement' },
                        { name: 'Trending Push', price: '$2.99', icon: 'trending-up', color: Colors.primary, desc: 'Boost in trending feed' },
                        { name: 'Verified Badge', price: '$9.99', icon: 'checkmark-circle', color: Colors.info, desc: 'Get verified creator badge' },
                    ].map((boost) => (
                        <Pressable key={boost.name} style={[styles.boostCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }, Shadows.md]}>
                            <View style={[styles.boostIcon, { backgroundColor: boost.color + '20' }]}>
                                <Ionicons name={boost.icon as any} size={24} color={boost.color} />
                            </View>
                            <Text style={[styles.boostName, { color: colors.text }]}>{boost.name}</Text>
                            <Text style={[styles.boostDesc, { color: colors.textMuted }]}>{boost.desc}</Text>
                            <View style={styles.boostPrice}>
                                <Text style={styles.boostPriceText}>{boost.price}</Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* My Videos */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📹 My Videos</Text>
                {myVideos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="videocam-off-outline" size={40} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No videos uploaded yet</Text>
                    </View>
                ) : (
                    myVideos.slice(0, 6).map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            horizontal
                            onPress={() => router.push(`/video/${video.id}` as any)}
                        />
                    ))
                )}

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: Layout.screenPadding },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm, marginTop: Spacing.sm },
    boostRow: { gap: Spacing.sm, paddingBottom: Spacing.md },
    boostCard: {
        borderRadius: Radius.lg, padding: Spacing.md,
        width: 160, alignItems: 'center', gap: Spacing.sm,
    },
    boostIcon: {
        width: 48, height: 48, borderRadius: Radius.full,
        justifyContent: 'center', alignItems: 'center',
    },
    boostName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
    boostDesc: { fontSize: 11, textAlign: 'center' },
    boostPrice: {
        backgroundColor: Colors.primary, paddingHorizontal: Spacing.md,
        paddingVertical: 6, borderRadius: Radius.full,
    },
    boostPriceText: { fontSize: 13, fontWeight: '700', color: Colors.white },
    emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
    emptyText: { fontSize: 14 },
});
