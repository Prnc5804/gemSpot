/**
 * Video Detail Screen — Embedded YouTube player + Firestore data
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    TextInput,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import { MOCK_VIDEOS, MOCK_COMMENTS } from '@/constants/mock-data';
import { VideoCard } from '@/components/video-card';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '@/services/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Video } from '@/constants/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = SCREEN_WIDTH * 0.5625; // 16:9

export default function VideoDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [voteCount, setVoteCount] = useState(0);
    const [comment, setComment] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(false);
    const [nextVideo, setNextVideo] = useState<Video | null>(null);

    const voteScale = useSharedValue(1);
    const voteAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: voteScale.value }],
    }));

    useEffect(() => {
        loadVideo();
    }, [id]);

    const loadVideo = async () => {
        setLoading(true);
        try {
            // Try Firestore first
            const docRef = doc(db, 'videos', id!);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { ...docSnap.data(), id: docSnap.id } as Video;
                setVideo(data);
                setVoteCount(data.voteCount || 0);
            } else {
                // Fall back to mock data
                const mockVideo = MOCK_VIDEOS.find((v) => v.id === id) || MOCK_VIDEOS[0];
                setVideo(mockVideo);
                setVoteCount(mockVideo.voteCount || 0);
            }

            // Load a "next" recommendation
            const nextQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(5));
            const nextSnap = await getDocs(nextQuery);
            const nextVideos = nextSnap.docs
                .map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
            const recommendation = nextVideos.find(v => v.id !== id);
            if (recommendation) {
                setNextVideo(recommendation);
            } else {
                setNextVideo(MOCK_VIDEOS.find((v) => v.id !== id) || MOCK_VIDEOS[1]);
            }
        } catch (error) {
            console.log('Failed to load video from Firestore:', error);
            const mockVideo = MOCK_VIDEOS.find((v) => v.id === id) || MOCK_VIDEOS[0];
            setVideo(mockVideo);
            setVoteCount(mockVideo.voteCount || 0);
            setNextVideo(MOCK_VIDEOS.find((v) => v.id !== id) || MOCK_VIDEOS[1]);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = () => {
        if (!voted) {
            setVoted(true);
            setVoteCount((v) => v + 1);
            voteScale.value = withSequence(
                withSpring(1.3, { damping: 6, stiffness: 200 }),
                withSpring(1, Animation.spring)
            );
        }
    };

    // Extract videoId for embed
    const getYouTubeVideoId = (v: Video): string => {
        // Try youtubeUrl field first (real Firestore data)
        if (v.youtubeUrl) {
            const match = v.youtubeUrl.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
            );
            if (match) return match[1];
        }
        // Try thumbnailUrl to extract videoId
        if (v.thumbnailUrl) {
            const match = v.thumbnailUrl.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
            if (match) return match[1];
        }
        return '';
    };

    if (loading || !video) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const ytVideoId = getYouTubeVideoId(video);

    const youtubeHtml = ytVideoId ? `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${ytVideoId}?rel=0&modestbranding=1&playsinline=1&autoplay=0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</body>
</html>` : '';

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>Video</Text>
                <Pressable style={styles.backBtn}>
                    <Ionicons name="share-outline" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Embedded YouTube Player */}
                <View style={styles.playerContainer}>
                    {youtubeHtml ? (
                        <WebView
                            source={{ html: youtubeHtml }}
                            style={styles.webview}
                            allowsFullscreenVideo
                            allowsInlineMediaPlayback
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled
                            scrollEnabled={false}
                            bounces={false}
                        />
                    ) : (
                        // Fallback thumbnail if no embed URL
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

                    {/* Points Earned */}
                    {!pointsEarned && (
                        <Pressable
                            style={styles.earnPointsChip}
                            onPress={() => setPointsEarned(true)}
                        >
                            <Ionicons name="diamond" size={12} color={Colors.accent} />
                            <Text style={styles.earnPointsText}>+10 pts for watching</Text>
                        </Pressable>
                    )}
                    {pointsEarned && (
                        <View style={[styles.earnPointsChip, styles.pointsEarned]}>
                            <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                            <Text style={[styles.earnPointsText, { color: Colors.success }]}>Points earned!</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    {/* Title */}
                    <Text style={styles.videoTitle}>{video.title}</Text>

                    {/* Creator Info */}
                    <View style={styles.creatorRow}>
                        <Image source={{ uri: video.creatorAvatar }} style={styles.creatorAvatar} />
                        <View style={styles.creatorInfo}>
                            <Text style={styles.creatorName}>{video.creatorName}</Text>
                            <Text style={styles.creatorSubs}>{(video.subscriberCount || 0).toLocaleString()} subscribers</Text>
                        </View>
                        <Pressable
                            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                            onPress={() => setIsFollowing(!isFollowing)}
                        >
                            <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Action Row */}
                    <View style={styles.actionRow}>
                        <AnimatedPressable style={[styles.voteAction, voted && styles.voteActionActive, voteAnimStyle]} onPress={handleVote}>
                            <Ionicons name={voted ? 'chevron-up-circle' : 'chevron-up-circle-outline'} size={24} color={voted ? Colors.white : Colors.primary} />
                            <Text style={[styles.voteActionText, voted && styles.voteActionTextActive]}>{voteCount}</Text>
                        </AnimatedPressable>
                        <Pressable style={styles.actionBtn}>
                            <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondaryDark} />
                            <Text style={styles.actionBtnText}>{video.commentCount || 0}</Text>
                        </Pressable>
                        <Pressable style={styles.actionBtn}>
                            <Ionicons name="bookmark-outline" size={20} color={Colors.textSecondaryDark} />
                            <Text style={styles.actionBtnText}>Save</Text>
                        </Pressable>
                        <Pressable style={styles.actionBtn}>
                            <Ionicons name="flag-outline" size={20} color={Colors.textSecondaryDark} />
                            <Text style={styles.actionBtnText}>Report</Text>
                        </Pressable>
                    </View>

                    {/* Ratings — only show if ratings exist */}
                    {video.ratings && (
                        <>
                            <Text style={styles.sectionTitle}>⭐ Ratings</Text>
                            <View style={styles.ratingsRow}>
                                {[
                                    { label: 'Editing', value: video.ratings.editing, icon: 'cut' },
                                    { label: 'Audio', value: video.ratings.audio, icon: 'musical-notes' },
                                    { label: 'Content', value: video.ratings.content, icon: 'bulb' },
                                ].map((r) => (
                                    <View key={r.label} style={[styles.ratingCard, Shadows.sm]}>
                                        <Ionicons name={r.icon as any} size={18} color={Colors.accent} />
                                        <Text style={styles.ratingValue}>{(r.value || 0).toFixed(1)}</Text>
                                        <Text style={styles.ratingLabel}>{r.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Comments */}
                    <Text style={styles.sectionTitle}>💬 Comments</Text>
                    <View style={styles.commentInput}>
                        <TextInput
                            style={styles.commentTextInput}
                            placeholder="Add a comment..."
                            placeholderTextColor={Colors.textMutedDark}
                            value={comment}
                            onChangeText={setComment}
                        />
                        <Pressable style={styles.commentSendBtn}>
                            <Ionicons name="send" size={18} color={Colors.primary} />
                        </Pressable>
                    </View>

                    {MOCK_COMMENTS.map((c) => (
                        <View key={c.id} style={styles.commentItem}>
                            <Image source={{ uri: c.userAvatar }} style={styles.commentAvatar} />
                            <View style={styles.commentContent}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.commentUser}>{c.userName}</Text>
                                    <Text style={styles.commentDate}>
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.commentText}>{c.text}</Text>
                                <View style={styles.commentLike}>
                                    <Ionicons name="heart-outline" size={14} color={Colors.textMutedDark} />
                                    <Text style={styles.commentLikeText}>{c.likes}</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Next Recommendation */}
                    {nextVideo && (
                        <>
                            <Text style={styles.sectionTitle}>🔮 Next Hidden Creator</Text>
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
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
    },
    playerContainer: {
        width: SCREEN_WIDTH,
        height: PLAYER_HEIGHT,
        backgroundColor: Colors.black,
        position: 'relative',
    },
    webview: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.black,
    },
    playerThumb: {
        width: '100%',
        height: PLAYER_HEIGHT,
    },
    playerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigPlayBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earnPointsChip: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: Spacing.xs + 2,
        borderRadius: Radius.full,
        zIndex: 10,
    },
    pointsEarned: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    earnPointsText: {
        ...Typography.badge,
        color: Colors.accent,
    },
    content: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: Spacing.md,
    },
    videoTitle: {
        ...Typography.screenTitle,
        color: Colors.textPrimaryDark,
        fontSize: 20,
        lineHeight: 28,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderDark,
    },
    creatorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: Colors.surfaceDark,
    },
    creatorInfo: {
        flex: 1,
    },
    creatorName: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
    },
    creatorSubs: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    followBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    followBtnActive: {
        backgroundColor: Colors.primary,
    },
    followText: {
        ...Typography.button,
        color: Colors.primary,
        fontSize: 13,
    },
    followTextActive: {
        color: Colors.white,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderDark,
    },
    voteAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    voteActionActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    voteActionText: {
        ...Typography.button,
        color: Colors.primary,
    },
    voteActionTextActive: {
        color: Colors.white,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 4,
    },
    actionBtnText: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        fontSize: 10,
    },
    sectionTitle: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    ratingsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    ratingCard: {
        flex: 1,
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingVertical: Spacing.sm + 4,
        alignItems: 'center',
        gap: 4,
    },
    ratingValue: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
    },
    ratingLabel: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
    },
    commentInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderDark,
    },
    commentTextInput: {
        flex: 1,
        ...Typography.body,
        color: Colors.textPrimaryDark,
        height: Layout.inputHeight,
    },
    commentSendBtn: {
        padding: Spacing.sm,
    },
    commentItem: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.surfaceDark,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    commentUser: {
        ...Typography.body,
        color: Colors.textPrimaryDark,
        fontWeight: '600',
        fontSize: 13,
    },
    commentDate: {
        ...Typography.caption,
        color: Colors.textMutedDark,
    },
    commentText: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        marginTop: 2,
    },
    commentLike: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: Spacing.xs,
    },
    commentLikeText: {
        ...Typography.caption,
        color: Colors.textMutedDark,
    },
});
