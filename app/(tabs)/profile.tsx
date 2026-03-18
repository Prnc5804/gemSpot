/**
 * Profile Screen — Shows real auth user, or login prompt if not signed in
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { ALL_BADGES } from '@/constants/mock-data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { getVideosByUser, deleteVideo } from '@/services/video-service';
import { getUserRank } from '@/services/user-service';
import type { Video } from '@/constants/types';

type MenuItem = { icon: keyof typeof Ionicons.glyphMap; label: string; route: string; color?: string; colorKey?: 'primary' | 'accent' | 'info' | 'textSecondary', roles: string[] };

const ALL_MENU_ITEMS: MenuItem[] = [
    { icon: 'stats-chart', label: 'Creator Dashboard', route: '/creator-dashboard', colorKey: 'primary', roles: ['creator'] },
    { icon: 'briefcase', label: 'Brand Deals', route: '/brand-deals', colorKey: 'accent', roles: ['creator', 'brand'] },
    { icon: 'cart', label: 'Creator Shop', route: '/shop', colorKey: 'info', roles: ['viewer', 'creator', 'brand'] },
    { icon: 'settings', label: 'Settings', route: '/settings', colorKey: 'textSecondary', roles: ['viewer', 'creator', 'brand'] },
];

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user, isLoading, isAuthenticated, signOut } = useAuth();
    const [myVideos, setMyVideos] = useState<Video[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userRank, setUserRank] = useState<number | null>(null);

    const loadMyVideos = useCallback(async () => {
        if (!user?.id) return;
        setLoadingVideos(true);
        try {
            const videos = await getVideosByUser(user.id);
            setMyVideos(videos);
        } catch (e) {
            console.log('Failed to load user videos:', e);
        } finally {
            setLoadingVideos(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadMyVideos();
            getUserRank(user.id).then((rank) => {
                if (rank > 0) setUserRank(rank);
            });
        }
    }, [isAuthenticated, user?.id, loadMyVideos]);

    const handleDeleteVideo = (videoId: string, title: string) => {
        Alert.alert(
            'Delete Video',
            `Are you sure you want to delete "${title}"?\n\nThis cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        const result = await deleteVideo(videoId, user!.id);
                        if (result.success) {
                            setMyVideos(prev => prev.filter(v => v.id !== videoId));
                            Alert.alert('Deleted', 'Video removed successfully');
                        } else {
                            Alert.alert('Error', result.error || 'Failed to delete');
                        }
                    },
                },
            ]
        );
    };

    // ── Loading State ──
    if (isLoading) {
        return (
            <View style={[styles.screen, styles.centeredContainer, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // ── Not Logged In — Show Login Prompt ──
    if (!isAuthenticated || !user) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top }]}>
                <View style={styles.loginPrompt}>
                    <View style={[styles.loginLogoCircle, Shadows.glow(Colors.primary)]}>
                        <Text style={{ fontSize: 40 }}>💎</Text>
                    </View>
                    <Text style={styles.loginTitle}>Welcome to GemSpots</Text>
                    <Text style={styles.loginSubtitle}>
                        Sign in to track your progress, earn badges, and unlock creator tools.
                    </Text>

                    <Pressable
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/login' as any)}
                    >
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            <Ionicons name="log-in-outline" size={20} color={Colors.white} />
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable
                        style={styles.signupButton}
                        onPress={() => router.push('/auth/signup' as any)}
                    >
                        <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
                        <Text style={styles.signupButtonText}>Create Account</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // ── Logged In — Show Profile ──
    const xpProgress = (user.xpToNext ?? 100) > 0 ? (user.xp ?? 0) / (user.xpToNext ?? 100) : 0;
    const earnedBadges = ALL_BADGES.filter((b) => !b.isLocked);
    const lockedBadges = ALL_BADGES.filter((b) => b.isLocked);

    const handleLogout = async () => {
        await signOut();
    };

    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <LinearGradient
                            colors={Colors.gradientPrimary}
                            style={styles.roleBadge}
                        >
                            <Text style={styles.roleText}>{user.role?.toUpperCase()}</Text>
                        </LinearGradient>
                    </View>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>
                        <Text style={styles.levelAccent}>Level {user.level ?? 1}</Text> · Gem Hunter
                    </Text>

                    {/* XP Progress Bar */}
                    <View style={[styles.xpBar, { backgroundColor: isDark ? colors.cardElevated : Colors.cardLightElevated }]}>
                        <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
                    </View>
                    <Text style={[styles.xpText, { color: colors.textMuted }]}>{user.xp ?? 0} / {user.xpToNext ?? 100} XP</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, Shadows.sm, { backgroundColor: cardBg, borderColor }]}>
                        <Ionicons name="diamond" size={20} color={Colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{(user.points ?? 0).toLocaleString()}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Points</Text>
                    </View>
                    <View style={[styles.statBox, Shadows.sm, { backgroundColor: cardBg, borderColor }]}>
                        <Ionicons name="flame" size={20} color={Colors.error} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{user.streak ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
                    </View>
                    <View style={[styles.statBox, Shadows.sm, { backgroundColor: cardBg, borderColor }]}>
                        <Ionicons name="trophy" size={20} color={Colors.accent} />
                        <Text style={[styles.statValue, { color: colors.text }]}>#{userRank || '?'}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rank</Text>
                    </View>
                    <View style={[styles.statBox, Shadows.sm, { backgroundColor: cardBg, borderColor }]}>
                        <Ionicons name="thumbs-up" size={20} color={Colors.info} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{user.votesToday ?? 0}/{user.maxVotesPerDay ?? 10}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Votes Today</Text>
                    </View>
                </View>

                {/* Streak Section */}
                <View style={[styles.streakCard, Shadows.md, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.streakHeader}>
                        <Text style={[styles.streakTitle, { color: colors.text }]}>🔥 {user.streak ?? 0}-Day Streak!</Text>
                        <Text style={[styles.streakSubtitle, { color: colors.textSecondary }]}>Keep voting daily to earn bonus XP</Text>
                    </View>
                    <View style={styles.streakDots}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <View key={i} style={styles.streakDay}>
                                <View style={[styles.streakDot, { backgroundColor: isDark ? colors.card : Colors.cardLightElevated }, i < (user.streak ?? 0) && styles.streakDotActive]}>
                                    {i < (user.streak ?? 0) && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                                </View>
                                <Text style={[styles.streakDayText, { color: colors.textMuted }]}>{day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Badges */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>🏅 Badges ({earnedBadges.length}/{ALL_BADGES.length})</Text>
                    <View style={styles.badgeVerticalList}>
                        {earnedBadges.map((badge) => (
                            <View key={badge.id} style={[styles.badgeListItem, Shadows.sm, { backgroundColor: cardBg, borderColor }]}>
                                <Text style={styles.badgeIconLarge}>{badge.icon}</Text>
                                <View style={styles.badgeInfo}>
                                    <Text style={[styles.badgeNameList, { color: colors.text }]}>{badge.name}</Text>
                                    <Text style={[styles.badgeDesc, { color: colors.textSecondary }]} numberOfLines={2}>{badge.description}</Text>
                                </View>
                            </View>
                        ))}
                        {lockedBadges.map((badge) => (
                            <View key={badge.id} style={[styles.badgeListItem, styles.badgeLocked, { backgroundColor: cardBg, borderColor }]}>
                                <Text style={styles.badgeIconLockedLarge}>🔒</Text>
                                <View style={styles.badgeInfo}>
                                    <Text style={[styles.badgeNameListLocked, { color: colors.textMuted }]}>{badge.name}</Text>
                                    <Text style={[styles.badgeDesc, { color: colors.textMuted }]} numberOfLines={2}>{badge.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* My Submissions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📤 My Submissions ({myVideos.length})</Text>
                    {loadingVideos ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.md }} />
                    ) : myVideos.length === 0 ? (
                        <View style={styles.emptySubmissions}>
                            <Ionicons name="videocam-off" size={32} color={colors.textMuted} />
                            <Text style={[styles.emptySubmissionsText, { color: colors.textSecondary }]}>No videos submitted yet</Text>
                            <Text style={[styles.emptySubmissionsHint, { color: colors.textMuted }]}>Discover a hidden gem and share it!</Text>
                        </View>
                    ) : (
                        myVideos.map((v) => (
                            <View key={v.id} style={[styles.submissionCard, { borderBottomColor: borderColor }]}>
                                <Image source={{ uri: v.thumbnailUrl }} style={styles.submissionThumb} />
                                <View style={styles.submissionInfo}>
                                    <Text style={[styles.submissionTitle, { color: colors.text }]} numberOfLines={2}>{v.title}</Text>
                                    <Text style={[styles.submissionMeta, { color: colors.textMuted }]}>
                                        {v.creatorName} · {v.voteCount || 0} votes
                                    </Text>
                                </View>
                                <Pressable
                                    style={styles.deleteBtn}
                                    onPress={() => handleDeleteVideo(v.id, v.title)}
                                >
                                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                </Pressable>
                            </View>
                        ))
                    )}
                </View>

                {/* Menu */}
                <View style={styles.section}>
                    {ALL_MENU_ITEMS
                        .filter((item: MenuItem) => item.roles.includes(user.role || 'viewer'))
                        .map((item: MenuItem, index: number) => {
                            const iconColor = item.color || (item.colorKey ? ((colors as any)[item.colorKey] || Colors[item.colorKey as keyof typeof Colors]) : colors.text);
                            return (
                                <Pressable
                                    key={item.label}
                                    style={[styles.menuItem, { borderBottomColor: borderColor }]}
                                    onPress={() => item.route ? router.push(item.route as any) : null}
                                >
                                    <View style={[styles.menuIconBg, { backgroundColor: iconColor + '20' }]}>
                                        <Ionicons name={item.icon} size={20} color={iconColor as string} />
                                    </View>
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </Pressable>
                            );
                        })}

                    {/* Log Out Button */}
                    <Pressable
                        style={styles.menuItem}
                        onPress={handleLogout}
                    >
                        <View style={[styles.menuIconBg, { backgroundColor: Colors.error + '20' }]}>
                            <Ionicons name="log-out" size={20} color={Colors.error} />
                        </View>
                        <Text style={[styles.menuLabel, { color: Colors.error }]}>Log Out</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Pressable>
                </View>

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },
    centeredContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
    },

    // ── Login Prompt ──
    loginPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    loginLogoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    loginTitle: {
        ...Typography.screenTitle,
        color: Colors.textPrimaryLight,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    loginSubtitle: {
        ...Typography.body,
        color: Colors.textSecondaryLight,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    loginButton: {
        width: '100%',
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadows.glow(Colors.primary),
        marginBottom: Spacing.md,
    },
    loginGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: Layout.buttonHeight + 4,
    },
    loginButtonText: {
        ...Typography.button,
        color: Colors.white,
        fontSize: 16,
    },
    signupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    signupButtonText: {
        ...Typography.body,
        color: Colors.primary,
        fontWeight: '600',
    },

    // ── Profile Header ──
    profileHeader: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.sm,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        borderColor: Colors.primary,
        backgroundColor: Colors.cardLightElevated,
    },
    roleBadge: {
        position: 'absolute',
        bottom: -4,
        alignSelf: 'center',
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    roleText: {
        ...Typography.badge,
        color: Colors.white,
        fontSize: 9,
        letterSpacing: 1,
    },
    userName: {
        fontSize: 24,
        fontFamily: 'Inter_800ExtraBold',
        fontWeight: '800',
        color: Colors.textPrimaryLight,
        marginTop: Spacing.sm,
    },
    levelLabel: {
        ...Typography.body,
        color: Colors.textSecondaryLight,
        marginTop: Spacing.xs,
    },
    levelAccent: {
        color: Colors.accent,
        fontWeight: '600',
    },
    xpBar: {
        width: '60%',
        height: 6,
        backgroundColor: Colors.cardLightElevated,
        borderRadius: Radius.full,
        marginTop: Spacing.sm,
        overflow: 'hidden',
    },
    xpFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
    },
    xpText: {
        ...Typography.caption,
        color: Colors.textMutedLight,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.sm + 4,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textMutedLight,
        textAlign: 'center',
    },
    streakCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    streakHeader: {
        marginBottom: Spacing.md,
    },
    streakTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
    },
    streakSubtitle: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondaryLight,
        marginTop: 4,
    },
    streakDots: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    streakDay: {
        alignItems: 'center',
        gap: 4,
    },
    streakDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.cardLightElevated,
        borderWidth: 1.5,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakDotActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    streakDayText: {
        fontSize: 11,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textMutedLight,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
        marginBottom: Spacing.sm,
    },
    badgeVerticalList: {
        flexDirection: 'column',
        gap: Spacing.sm,
    },
    badgeListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    badgeLocked: {
        opacity: 0.5,
    },
    badgeIconLarge: {
        fontSize: 32,
    },
    badgeIconLockedLarge: {
        fontSize: 28,
    },
    badgeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    badgeNameList: {
        fontSize: 15,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
        marginBottom: 2,
    },
    badgeNameListLocked: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textMutedLight,
        marginBottom: 2,
    },
    badgeDesc: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondaryLight,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    menuBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.04)',
    },
    menuIconBg: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textPrimaryLight,
        flex: 1,
    },

    // My Submissions
    emptySubmissions: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    emptySubmissionsText: {
        fontSize: 15,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textSecondaryLight,
    },
    emptySubmissionsHint: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: Colors.textMutedLight,
    },
    submissionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm + 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.04)',
    },
    submissionThumb: {
        width: 80,
        height: 45,
        borderRadius: Radius.md,
        backgroundColor: Colors.cardLightElevated,
    },
    submissionInfo: {
        flex: 1,
        gap: 2,
    },
    submissionTitle: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textPrimaryLight,
    },
    submissionMeta: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondaryLight,
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        backgroundColor: Colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
