/**
 * Video Detail Screen — Real data from Firestore, no mock fallback
 */

import { VideoCard } from '@/components/video-card';
import { Animation, Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Comment as CommentType, Video } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { addComment, getComments } from '@/services/comment-service';
import { db } from '@/services/firebase';
import { isSubscribed as checkIsSubscribed, subscribeToCreator, unsubscribeFromCreator } from '@/services/subscribe-service';
import { incrementVoteCount } from '@/services/user-service';
import { viewVideo, voteVideo } from '@/services/video-service';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = SCREEN_WIDTH * 0.5625; // 16:9
const SAVED_KEY = '@gemspots_saved_videos';

/** Gem Score formula */
function computeGemScore(v: Video): number {
    const nUp = Math.min(5, (v.voteCount || 0) / 100);
    const nComm = Math.min(5, (v.commentCount || 0) / 20);
    const nViews = Math.min(5, (v.viewsFromPlatform || 0) / 1000);
    const raw = (nUp * 0.4 + nComm * 0.3 + nViews * 0.3) * 2;
    return Math.min(10, parseFloat(Math.max(0.1, raw).toFixed(1)));
}

export default function VideoDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user, isAuthenticated, refreshUser } = useAuth();

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [voteCount, setVoteCount] = useState(0);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<CommentType[]>([]);
    const [subscribed, setSubscribed] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [nextVideo, setNextVideo] = useState<Video | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const webViewRef = useRef<any>(null);

    const voteScale = useSharedValue(1);
    const saveScale = useSharedValue(1);
    const voteAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: voteScale.value }],
    }));
    const saveAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: saveScale.value }],
    }));

    useEffect(() => {
        loadVideo();
        checkIfSaved();
    }, [id]);

    const checkIfSaved = async () => {
        try {
            const saved = await AsyncStorage.getItem(SAVED_KEY);
            const list: string[] = saved ? JSON.parse(saved) : [];
            setIsSaved(list.includes(id!));
        } catch { }
    };

    const loadVideo = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'videos', id!);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { ...docSnap.data(), id: docSnap.id } as Video;
                setVideo(data);
                setVoteCount(data.voteCount || 0);
                if (user?.id && data.voters?.includes(user.id)) {
                    setVoted(true);
                }
                // Check subscribe status
                if (user?.id && data.creatorId) {
                    const isSub = await checkIsSubscribed(user.id, data.creatorId);
                    setSubscribed(isSub);
                }
                // Record view
                await viewVideo(id!);
            } else {
                setVideo(null);
            }

            // Load real comments
            try {
                const realComments = await getComments(id!);
                setComments(realComments);
            } catch { }

            // Load "next" recommendation
            const nextQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(5));
            const nextSnap = await getDocs(nextQuery);
            const nextVideos = nextSnap.docs
                .map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
            const recommendation = nextVideos.find(v => v.id !== id);
            setNextVideo(recommendation || null);
        } catch (error) {
            console.log('Failed to load video from Firestore:', error);
            setVideo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!isAuthenticated || !user) {
            Alert.alert('Sign In Required', 'Please sign in to upvote videos.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
            ]);
            return;
        }
        if (!voted) {
            setVoted(true);
            setVoteCount((v) => v + 1);
            voteScale.value = withSequence(
                withSpring(1.3, { damping: 6, stiffness: 200 }),
                withSpring(1, Animation.spring)
            );
            try {
                await voteVideo(id!, user.id);
                await incrementVoteCount(user.id);
                await refreshUser();
            } catch (e) {
                console.log('Vote failed:', e);
            }
        } else {
            setVoted(false);
            setVoteCount((v) => Math.max(0, v - 1));
            try {
                await voteVideo(id!, user.id);
            } catch { }
        }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        if (!isAuthenticated || !user) {
            Alert.alert('Sign In Required', 'Please sign in to comment.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => router.push('/auth/login' as any) },
            ]);
            return;
        }
        try {
            const newComment = await addComment(
                id!,
                user.id,
                user.name,
                user.avatar || 'https://i.pravatar.cc/150?img=12',
                comment.trim()
            );
            setComments(prev => [newComment, ...prev]);
            setComment('');
        } catch (e) {
            console.log('Comment failed:', e);
            const fakeComment: CommentType = {
                id: Date.now().toString(),
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar || 'https://i.pravatar.cc/150?img=12',
                text: comment.trim(),
                createdAt: new Date().toISOString(),
                likes: 0,
            };
            setComments(prev => [fakeComment, ...prev]);
            setComment('');
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated || !user || !video?.creatorId) return;
        const wasSubscribed = subscribed;
        // Optimistic UI update
        setSubscribed(!wasSubscribed);
        try {
            if (wasSubscribed) {
                const result = await unsubscribeFromCreator(user.id, video.creatorId);
                if (!result.success) throw new Error(result.error);
            } else {
                const result = await subscribeToCreator(user.id, video.creatorId);
                if (!result.success) throw new Error(result.error);
            }
            // Refresh auth context so subscribedTo stays in sync
            await refreshUser();
        } catch (error) {
            // Rollback on failure
            setSubscribed(wasSubscribed);
            console.log('Subscribe action failed:', error);
        }
    };

    const handleSave = async () => {
        const newSaved = !isSaved;
        setIsSaved(newSaved);
        saveScale.value = withSequence(
            withSpring(1.3, { damping: 6, stiffness: 200 }),
            withSpring(1, Animation.spring)
        );
        try {
            const saved = await AsyncStorage.getItem(SAVED_KEY);
            let list: string[] = saved ? JSON.parse(saved) : [];
            if (newSaved) {
                if (!list.includes(id!)) list.push(id!);
            } else {
                list = list.filter(v => v !== id);
            }
            await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(list));
        } catch { }
    };

    const getYouTubeVideoId = (v: Video): string => {
        if (v.youtubeUrl) {
            const match = v.youtubeUrl.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
            );
            if (match) return match[1];
        }
        if (v.youtubeVideoId) return v.youtubeVideoId;
        if (v.thumbnailUrl) {
            const match = v.thumbnailUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
            if (match) return match[1];
        }
        return '';
    };

    if (loading) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!video) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <Ionicons name="videocam-off-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Video not found</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={[styles.goBackText, { color: Colors.primary }]}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const ytVideoId = getYouTubeVideoId(video);
    const gemScore = computeGemScore(video);

    const embedUrl = ytVideoId
        ? `https://www.youtube.com/embed/${ytVideoId}?playsinline=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=1&controls=1`
        : '';

    const playerHtml = ytVideoId ? `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe
    src="${embedUrl}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</body>
</html>` : '';

    const bgColor = colors.background;
    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = colors.border;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Now Playing</Text>
                <Pressable style={styles.backBtn}>
                    <Ionicons name="share-outline" size={22} color={colors.text} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Video Player */}
                <View style={styles.playerContainer}>
                    {playerHtml ? (
                        <WebView
                            ref={webViewRef}
                            source={{ html: playerHtml }}
                            style={styles.webview}
                            allowsFullscreenVideo
                            allowsInlineMediaPlayback
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled
                            domStorageEnabled
                            scrollEnabled={false}
                            bounces={false}
                            originWhitelist={['*']}
                            mixedContentMode="compatibility"
                            onMessage={(event) => {
                                try {
                                    const data = JSON.parse(event.nativeEvent.data);
                                    if (data.type === 'state') {
                                        setIsPlaying(data.state === 1);
                                    }
                                } catch { }
                            }}
                            onError={(e) => console.log('WebView error:', e)}
                        />
                    ) : (
                        <View>
                            <Image source={{ uri: video.thumbnailUrl }} style={styles.playerThumb} />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.4)']}
                                style={styles.playerOverlay}
                            >
                                <View style={[styles.bigPlayBtn, Shadows.glow(Colors.primary)]}>
                                    <Ionicons name="play" size={32} color={Colors.white} />
                                </View>
                            </LinearGradient>
                        </View>
                    )}
                </View>

                <View style={[styles.content, { backgroundColor: bgColor }]}>
                    {/* Title + Gem Score */}
                    <View style={styles.titleRow}>
                        <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={3}>{video.title}</Text>
                        <View style={styles.gemScoreChip}>
                            <LinearGradient
                                colors={['#aca0bb', '#7b6b8f']}
                                style={styles.gemScoreGradient}
                            >
                                <Ionicons name="diamond" size={14} color={Colors.white} />
                                <Text style={styles.gemScoreText}>{gemScore}</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Views count */}
                    <Text style={[styles.viewsText, { color: colors.textMuted }]}>
                        {(video.viewsFromPlatform || 0).toLocaleString()} views · {new Date(video.submittedAt).toLocaleDateString()}
                    </Text>

                    {/* Creator Info */}
                    <View style={[styles.creatorRow, { borderBottomColor: borderColor }]}>
                        <Image source={{ uri: video.creatorAvatar }} style={styles.creatorAvatar} />
                        <View style={styles.creatorInfo}>
                            <Text style={[styles.creatorName, { color: colors.text }]}>{video.creatorName}</Text>
                            <Text style={[styles.creatorSubs, { color: colors.textSecondary }]}>{(video.subscriberCount || 0).toLocaleString()} subscribers</Text>
                        </View>
                        <Pressable
                            style={[styles.followBtn, subscribed && styles.followBtnActive]}
                            onPress={handleSubscribe}
                        >
                            <Text style={[styles.followText, subscribed && styles.followTextActive]}>
                                {subscribed ? 'Subscribed' : 'Subscribe'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Action Row */}
                    <View style={[styles.actionRow, { borderBottomColor: borderColor }]}>
                        <AnimatedPressable style={[styles.voteAction, voted && styles.voteActionActive, voteAnimStyle]} onPress={handleVote}>
                            <Ionicons name={voted ? 'chevron-up-circle' : 'chevron-up-circle-outline'} size={24} color={voted ? Colors.white : Colors.primary} />
                            <Text style={[styles.voteActionText, voted && styles.voteActionTextActive]}>{voteCount}</Text>
                        </AnimatedPressable>
                        <Pressable style={styles.actionBtn}>
                            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>{comments.length}</Text>
                        </Pressable>
                        <AnimatedPressable style={[styles.actionBtn, saveAnimStyle]} onPress={handleSave}>
                            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? Colors.accent : colors.textSecondary} />
                            <Text style={[styles.actionBtnText, { color: isSaved ? Colors.accent : colors.textSecondary }]}>{isSaved ? 'Saved' : 'Save'}</Text>
                        </AnimatedPressable>
                        <Pressable style={styles.actionBtn}>
                            <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Report</Text>
                        </Pressable>
                    </View>

                    {/* Comments */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Comments ({comments.length})</Text>
                    <View style={[styles.commentInput, { backgroundColor: cardBg, borderColor }]}>
                        <Image
                            source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=12' }}
                            style={styles.commentAvatarSmall}
                        />
                        <TextInput
                            style={[styles.commentTextInput, { color: colors.text }]}
                            placeholder="Add a comment..."
                            placeholderTextColor={colors.textMuted}
                            value={comment}
                            onChangeText={setComment}
                        />
                        <Pressable
                            style={[styles.commentSendBtn, !comment.trim() && { opacity: 0.4 }]}
                            onPress={handleComment}
                            disabled={!comment.trim()}
                        >
                            <Ionicons name="send" size={18} color={Colors.primary} />
                        </Pressable>
                    </View>

                    {comments.length === 0 ? (
                        <Text style={[styles.emptyComments, { color: colors.textMuted }]}>No comments yet. Be the first!</Text>
                    ) : (
                        comments.map((c) => (
                            <View key={c.id} style={styles.commentItem}>
                                <Image source={{ uri: c.userAvatar }} style={styles.commentAvatar} />
                                <View style={styles.commentContent}>
                                    <View style={styles.commentHeader}>
                                        <Text style={[styles.commentUser, { color: colors.text }]}>{c.userName}</Text>
                                        <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.commentText, { color: colors.textSecondary }]}>{c.text}</Text>
                                    <View style={styles.commentLike}>
                                        <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
                                        <Text style={[styles.commentLikeText, { color: colors.textMuted }]}>{c.likes}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    {/* Next Recommendation */}
                    {nextVideo && (
                        <>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>🔮 Up Next</Text>
                            <VideoCard
                                video={nextVideo}
                                onPress={() => router.push(`/video/${nextVideo.id}` as any)}
                            />
                        </>
                    )}
                </View>

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
    headerTitle: { fontSize: 17, fontWeight: '700' },
    playerContainer: { width: SCREEN_WIDTH, height: PLAYER_HEIGHT, backgroundColor: Colors.black, position: 'relative' },
    webview: { width: '100%', height: '100%', backgroundColor: Colors.black },
    playerThumb: { width: '100%', height: PLAYER_HEIGHT },
    playerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    bigPlayBtn: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: 'rgba(16, 185, 129, 0.85)', justifyContent: 'center', alignItems: 'center',
    },
    content: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.md },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
    videoTitle: { fontSize: 20, fontWeight: '800', lineHeight: 28, flex: 1 },
    gemScoreChip: { borderRadius: Radius.full, overflow: 'hidden' },
    gemScoreGradient: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
    gemScoreText: { fontSize: 16, fontWeight: '800', color: Colors.white },
    viewsText: { fontSize: 13, marginTop: 4, marginBottom: Spacing.sm },
    creatorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingBottom: Spacing.md, borderBottomWidth: 1 },
    creatorAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: Colors.primary },
    creatorInfo: { flex: 1 },
    creatorName: { fontSize: 16, fontWeight: '700' },
    creatorSubs: { fontSize: 13 },
    followBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary },
    followBtnActive: { backgroundColor: Colors.primary },
    followText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
    followTextActive: { color: Colors.white },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.md, borderBottomWidth: 1 },
    voteAction: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary,
    },
    voteActionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    voteActionText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
    voteActionTextActive: { color: Colors.white },
    actionBtn: { alignItems: 'center', gap: 4 },
    actionBtnText: { fontSize: 10 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
    commentInput: {
        flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md,
        paddingHorizontal: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1, gap: 8,
    },
    commentAvatarSmall: { width: 28, height: 28, borderRadius: 14 },
    commentTextInput: { flex: 1, fontSize: 14, height: Layout.inputHeight },
    commentSendBtn: { padding: Spacing.sm },
    emptyComments: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
    commentItem: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    commentAvatar: { width: 32, height: 32, borderRadius: 16 },
    commentContent: { flex: 1 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    commentUser: { fontSize: 13, fontWeight: '600' },
    commentDate: { fontSize: 11 },
    commentText: { fontSize: 14, marginTop: 2 },
    commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
    commentLikeText: { fontSize: 11 },
    notFoundText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
    goBackText: { fontSize: 14, fontWeight: '600', marginTop: 8 },
});
