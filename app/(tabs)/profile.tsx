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
import { getVideosByUser, deleteVideo } from '@/services/video-service';
import type { Video } from '@/constants/types';

type MenuItem = { icon: keyof typeof Ionicons.glyphMap; label: string; route: string; color: string; roles: string[] };

const ALL_MENU_ITEMS: MenuItem[] = [
    { icon: 'stats-chart', label: 'Creator Dashboard', route: '/creator-dashboard', color: Colors.primary, roles: ['creator'] },
    { icon: 'briefcase', label: 'Brand Deals', route: '/brand-deals', color: Colors.accent, roles: ['creator', 'brand'] },
    { icon: 'cart', label: 'Creator Shop', route: '/shop', color: Colors.info, roles: ['viewer', 'creator', 'brand'] },
    { icon: 'settings', label: 'Settings', route: '', color: Colors.textSecondaryDark, roles: ['viewer', 'creator', 'brand'] },
];

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, isLoading, isAuthenticated, signOut } = useAuth();
    const [myVideos, setMyVideos] = useState<Video[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
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
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.levelLabel}>
                        <Text style={styles.levelAccent}>Level {user.level ?? 1}</Text> · Gem Hunter
                    </Text>

                    {/* XP Progress Bar */}
                    <View style={styles.xpBar}>
                        <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
                    </View>
                    <Text style={styles.xpText}>{user.xp ?? 0} / {user.xpToNext ?? 100} XP</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, Shadows.sm]}>
                        <Ionicons name="diamond" size={20} color={Colors.primary} />
                        <Text style={styles.statValue}>{(user.points ?? 0).toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={[styles.statBox, Shadows.sm]}>
                        <Ionicons name="flame" size={20} color={Colors.error} />
                        <Text style={styles.statValue}>{user.streak ?? 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={[styles.statBox, Shadows.sm]}>
                        <Ionicons name="trophy" size={20} color={Colors.accent} />
                        <Text style={styles.statValue}>#{3}</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                    <View style={[styles.statBox, Shadows.sm]}>
                        <Ionicons name="thumbs-up" size={20} color={Colors.info} />
                        <Text style={styles.statValue}>{user.votesToday ?? 0}/{user.maxVotesPerDay ?? 10}</Text>
                        <Text style={styles.statLabel}>Votes Today</Text>
                    </View>
                </View>

                {/* Streak Section */}
                <View style={[styles.streakCard, Shadows.md]}>
                    <View style={styles.streakHeader}>
                        <Text style={styles.streakTitle}>🔥 {user.streak ?? 0}-Day Streak!</Text>
                        <Text style={styles.streakSubtitle}>Keep voting daily to earn bonus XP</Text>
                    </View>
                    <View style={styles.streakDots}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <View key={i} style={styles.streakDay}>
                                <View style={[styles.streakDot, i < (user.streak ?? 0) && styles.streakDotActive]}>
                                    {i < (user.streak ?? 0) && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                                </View>
                                <Text style={styles.streakDayText}>{day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Badges */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏅 Badges ({earnedBadges.length}/{ALL_BADGES.length})</Text>
                    <View style={styles.badgeGrid}>
                        {earnedBadges.map((badge) => (
                            <View key={badge.id} style={[styles.badgeItem, Shadows.sm]}>
                                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                <Text style={styles.badgeName}>{badge.name}</Text>
                            </View>
                        ))}
                        {lockedBadges.map((badge) => (
                            <View key={badge.id} style={[styles.badgeItem, styles.badgeLocked]}>
                                <Text style={styles.badgeIconLocked}>🔒</Text>
                                <Text style={styles.badgeNameLocked}>{badge.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* My Submissions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📤 My Submissions ({myVideos.length})</Text>
                    {loadingVideos ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.md }} />
                    ) : myVideos.length === 0 ? (
                        <View style={styles.emptySubmissions}>
                            <Ionicons name="videocam-off" size={32} color={Colors.textMutedDark} />
                            <Text style={styles.emptySubmissionsText}>No videos submitted yet</Text>
                            <Text style={styles.emptySubmissionsHint}>Discover a hidden gem and share it!</Text>
                        </View>
                    ) : (
                        myVideos.map((v) => (
                            <View key={v.id} style={styles.submissionCard}>
                                <Image source={{ uri: v.thumbnailUrl }} style={styles.submissionThumb} />
                                <View style={styles.submissionInfo}>
                                    <Text style={styles.submissionTitle} numberOfLines={2}>{v.title}</Text>
                                    <Text style={styles.submissionMeta}>
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
                        .map((item: MenuItem, index: number) => (
                            <Pressable
                                key={item.label}
                                style={[styles.menuItem, styles.menuBorder]}
                                onPress={() => item.route ? router.push(item.route as any) : null}
                            >
                                <View style={[styles.menuIconBg, { backgroundColor: item.color + '20' }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={18} color={Colors.textMutedDark} />
                            </Pressable>
                        ))}

                    {/* Log Out Button */}
                    <Pressable
                        style={styles.menuItem}
                        onPress={handleLogout}
                    >
                        <View style={[styles.menuIconBg, { backgroundColor: Colors.error + '20' }]}>
                            <Ionicons name="log-out" size={20} color={Colors.error} />
                        </View>
                        <Text style={[styles.menuLabel, { color: Colors.error }]}>Log Out</Text>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMutedDark} />
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
        backgroundColor: Colors.backgroundDark,
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
        color: Colors.textPrimaryDark,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    loginSubtitle: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
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
        backgroundColor: Colors.surfaceDark,
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
        ...Typography.screenTitle,
        color: Colors.textPrimaryDark,
        marginTop: Spacing.sm,
    },
    levelLabel: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        marginTop: Spacing.xs,
    },
    levelAccent: {
        color: Colors.accent,
        fontWeight: '600',
    },
    xpBar: {
        width: '60%',
        height: 6,
        backgroundColor: Colors.cardDark,
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
        color: Colors.textMutedDark,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
        fontSize: 15,
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        fontSize: 10,
        textAlign: 'center',
    },
    streakCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.error + '30',
    },
    streakHeader: {
        marginBottom: Spacing.md,
    },
    streakTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
    },
    streakSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        marginTop: 2,
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
        backgroundColor: Colors.surfaceDark,
        borderWidth: 1.5,
        borderColor: Colors.borderDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakDotActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    streakDayText: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        fontSize: 10,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
        marginBottom: Spacing.sm,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    badgeItem: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
        paddingHorizontal: Spacing.sm + 4,
        alignItems: 'center',
        minWidth: 80,
        gap: 4,
    },
    badgeLocked: {
        opacity: 0.4,
    },
    badgeIcon: {
        fontSize: 24,
    },
    badgeIconLocked: {
        fontSize: 20,
    },
    badgeName: {
        ...Typography.caption,
        color: Colors.textPrimaryDark,
        fontWeight: '500',
        textAlign: 'center',
    },
    badgeNameLocked: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    menuBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderDark,
    },
    menuIconBg: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        flex: 1,
        fontWeight: '500',
    },

    // My Submissions
    emptySubmissions: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    emptySubmissionsText: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        fontWeight: '500',
    },
    emptySubmissionsHint: {
        ...Typography.caption,
        color: Colors.textMutedDark,
    },
    submissionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderDark,
    },
    submissionThumb: {
        width: 80,
        height: 45,
        borderRadius: Radius.sm,
        backgroundColor: Colors.surfaceDark,
    },
    submissionInfo: {
        flex: 1,
        gap: 2,
    },
    submissionTitle: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        fontSize: 13,
        fontWeight: '500',
    },
    submissionMeta: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
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
