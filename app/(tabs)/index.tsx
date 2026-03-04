import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { CATEGORIES } from '@/constants/types';
import { MOCK_VIDEOS, MOCK_CREATORS } from '@/constants/mock-data';
import { CategoryChip } from '@/components/category-chip';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '@/services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Video, Creator } from '@/constants/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_HEIGHT = SCREEN_WIDTH * 0.5625; // 16:9

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(30));
      const videosSnap = await getDocs(videosQuery);
      const firestoreVideos = videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];

      const combinedVideos = [...firestoreVideos, ...MOCK_VIDEOS.filter(
        mv => !firestoreVideos.some(fv => fv.id === mv.id)
      )];
      setAllVideos(combinedVideos);
    } catch (error) {
      console.log('Firestore fetch failed, using mock data:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  // Filter videos
  const filteredVideos = allVideos.filter(v => {
    if (selectedCategory && v.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q);
    }
    return true;
  });

  // Compute GemScore for a video
  const getGemScore = (v: Video): number | null => {
    const r = v.ratings;
    if (!r || (!r.editing && !r.audio && !r.content)) return null;
    const avg = ((r.editing + r.audio + r.content) / 3) * 2;
    return Math.min(10, parseFloat(avg.toFixed(1)));
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ═══ HEADER ═══ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoIcon}>💎</Text>
          <Text style={styles.logo}>
            Gem<Text style={styles.logoAccent}>Spots</Text>
          </Text>
        </View>
        <Pressable style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators..."
            placeholderTextColor={Colors.textMutedDark}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Pressable>
      </View>

      {/* ═══ CATEGORY CHIPS ═══ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <CategoryChip
          name="All"
          emoji="🔥"
          isSelected={selectedCategory === null}
          onPress={() => setSelectedCategory(null)}
        />
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.name}
            name={cat.name}
            emoji={cat.emoji}
            isSelected={selectedCategory === cat.name}
            onPress={() => setSelectedCategory(cat.name)}
          />
        ))}
      </ScrollView>

      {/* ═══ VERTICAL VIDEO FEED ═══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-off-outline" size={48} color={Colors.textMutedDark} />
            <Text style={styles.emptyTitle}>No videos found</Text>
            <Text style={styles.emptyHint}>Try a different category or search term</Text>
          </View>
        ) : (
          filteredVideos.map((video) => {
            const score = getGemScore(video);
            return (
              <Pressable
                key={video.id}
                style={styles.videoCard}
                onPress={() => router.push(`/video/${video.id}` as any)}
              >
                {/* Thumbnail */}
                <View style={styles.thumbContainer}>
                  <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} />

                  {/* GemScore Badge */}
                  {score !== null && (
                    <View style={styles.gemScoreBadge}>
                      <Ionicons name="diamond" size={12} color={Colors.white} />
                      <Text style={styles.gemScoreText}>{score}</Text>
                    </View>
                  )}

                  {/* Play overlay */}
                  <View style={styles.playOverlay}>
                    <View style={styles.playCircle}>
                      <Ionicons name="play" size={24} color={Colors.white} />
                    </View>
                  </View>

                  {/* Duration badge (bottom-right) */}
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>
                      {video.viewsFromPlatform ? `${(video.viewsFromPlatform / 1000).toFixed(1)}K` : '0:00'}
                    </Text>
                  </View>
                </View>

                {/* Video Info Row */}
                <View style={styles.infoRow}>
                  <Image source={{ uri: video.creatorAvatar }} style={styles.avatarSmall} />
                  <View style={styles.infoText}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                    <Text style={styles.videoMeta}>
                      {video.creatorName} · {(video.viewsFromPlatform || 0).toLocaleString()} views
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    fontSize: 22,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimaryDark,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: Colors.primary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    height: 36,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimaryDark,
    padding: 0,
  },

  // ─── Category Chips ───
  chipRow: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
  },

  // ─── Feed ───
  feedContent: {
    paddingBottom: Spacing.md,
  },

  // ─── Video Card ───
  videoCard: {
    marginBottom: 20,
  },
  thumbContainer: {
    width: SCREEN_WIDTH,
    height: THUMB_HEIGHT,
    backgroundColor: Colors.surfaceDark,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  gemScoreBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  gemScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },

  // ─── Info Row ───
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 10,
    gap: 12,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  infoText: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimaryDark,
    lineHeight: 20,
  },
  videoMeta: {
    fontSize: 12,
    color: Colors.textSecondaryDark,
    marginTop: 2,
  },

  // ─── Empty ───
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondaryDark,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMutedDark,
  },
});
