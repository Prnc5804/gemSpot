/**
 * Discover Screen — Three sections: Hidden Gems, Trending Creators, New Creators
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Layout } from '@/constants/theme';
import type { Video } from '@/constants/types';
import { MOCK_VIDEOS } from '@/constants/mock-data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '@/services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_THUMB_SIZE = (SCREEN_WIDTH - 32 - 12) * 0.4; // ~40% of card width

type FilterTab = 'all' | 'trending' | 'hidden_gems' | 'new_creators';

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [allVideos, setAllVideos] = useState<Video[]>(MOCK_VIDEOS);

  const fetchVideos = async () => {
    try {
      const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const firestoreVideos = snap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
      const combined = [...firestoreVideos, ...MOCK_VIDEOS.filter(
        mv => !firestoreVideos.some(fv => fv.id === mv.id)
      )];
      setAllVideos(combined);
    } catch (error) {
      console.log('Firestore fetch failed, using mock data:', error);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  }, []);

  // ─── Algorithm Logic ───

  // Search filter
  const searchFiltered = useMemo(() => {
    if (!search) return allVideos;
    const q = search.toLowerCase();
    return allVideos.filter(v =>
      v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q)
    );
  }, [search, allVideos]);

  // 1. Hidden Gems: Creators with < 1000 subscribers, sorted by votes (quality small creators)
  const hiddenGems = useMemo(() => {
    return searchFiltered
      .filter(v => v.subscriberCount < 1000)
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 10);
  }, [searchFiltered]);

  // 2. Trending Creators: Most votes in the platform, sorted by votes descending
  const trendingCreators = useMemo(() => {
    return searchFiltered
      .slice()
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 10);
  }, [searchFiltered]);

  // 3. New Creators: Most recently submitted, sorted by date
  const newCreators = useMemo(() => {
    return searchFiltered
      .slice()
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
      .slice(0, 10);
  }, [searchFiltered]);

  // Format subscriber count
  const formatSubs = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // ─── Creator Card Component ───
  const CreatorListCard = ({ video, rank }: { video: Video; rank?: number }) => (
    <Pressable
      style={styles.creatorCard}
      onPress={() => router.push(`/video/${video.id}` as any)}
    >
      {/* Thumbnail */}
      <View style={styles.cardThumbContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.cardThumb} />
        <View style={styles.cardPlayOverlay}>
          <Ionicons name="play-circle" size={28} color="rgba(255,255,255,0.85)" />
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardNameRow}>
          {rank !== undefined && (
            <Text style={styles.cardRank}>{rank}.</Text>
          )}
          <Text style={styles.cardName} numberOfLines={1}>{video.creatorName}</Text>
        </View>
        <Text style={styles.cardMeta}>
          {video.category || 'General'} · {formatSubs(video.subscriberCount)} subscribers
        </Text>
        <View style={styles.cardBottom}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{video.category || 'General'}</Text>
          </View>
          <View style={styles.voteBadge}>
            <Ionicons name="thumbs-up" size={13} color={Colors.primary} />
            <Text style={styles.voteText}>{video.voteCount || 0}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  // ─── Section Header ───
  const SectionHead = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Pressable style={styles.seeAllBtn}>
        <Text style={styles.seeAllText}>See All</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
      </Pressable>
    </View>
  );

  // Should show section based on tab filter
  const showSection = (section: 'hidden_gems' | 'trending' | 'new_creators') => {
    if (activeTab === 'all') return true;
    return activeTab === section;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ═══ SEARCH BAR ═══ */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMutedDark} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators, videos..."
            placeholderTextColor={Colors.textMutedDark}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMutedDark} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ═══ FILTER TABS ═══ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {([
          { key: 'trending' as FilterTab, emoji: '🔥', label: 'Trending' },
          { key: 'hidden_gems' as FilterTab, emoji: '✨', label: 'Hidden Gems' },
          { key: 'new_creators' as FilterTab, emoji: '🆕', label: 'New Creators' },
        ]).map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
            onPress={() => setActiveTab(activeTab === tab.key ? 'all' : tab.key)}
          >
            <Text style={styles.filterTabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ═══ CONTENT ═══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ═══ 1. HIDDEN GEMS ═══ */}
        {showSection('hidden_gems') && (
          <View style={styles.section}>
            <SectionHead emoji="💎" title="Hidden Gems" />
            <Text style={styles.sectionSubtitle}>Small creators with amazing content</Text>
            {hiddenGems.length === 0 ? (
              <Text style={styles.emptyText}>No hidden gems found</Text>
            ) : (
              hiddenGems.map((v) => <CreatorListCard key={v.id} video={v} />)
            )}
          </View>
        )}

        {/* ═══ 2. TRENDING CREATORS ═══ */}
        {showSection('trending') && (
          <View style={styles.section}>
            <SectionHead emoji="🔥" title="Trending Creators" />
            {trendingCreators.length === 0 ? (
              <Text style={styles.emptyText}>No trending creators found</Text>
            ) : (
              trendingCreators.map((v, i) => <CreatorListCard key={v.id} video={v} rank={i + 1} />)
            )}
          </View>
        )}

        {/* ═══ 3. NEW CREATORS ═══ */}
        {showSection('new_creators') && (
          <View style={styles.section}>
            <SectionHead emoji="🆕" title="New Creators" />
            <Text style={styles.sectionSubtitle}>Recently discovered on GemSpots</Text>
            {newCreators.length === 0 ? (
              <Text style={styles.emptyText}>No new creators found</Text>
            ) : (
              newCreators.map((v) => <CreatorListCard key={v.id} video={v} />)
            )}
          </View>
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

  // ─── Search ───
  searchContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimaryDark,
    padding: 0,
  },

  // ─── Filter Tabs ───
  tabRow: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabEmoji: {
    fontSize: 14,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondaryDark,
  },
  filterTabTextActive: {
    color: Colors.white,
  },

  // ─── Content ───
  content: {
    paddingBottom: Spacing.md,
  },

  // ─── Section ───
  section: {
    paddingTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimaryDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMutedDark,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 10,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  // ─── Creator Card ───
  creatorCard: {
    flexDirection: 'row',
    marginHorizontal: Layout.screenPadding,
    marginBottom: 10,
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  cardThumbContainer: {
    width: CARD_THUMB_SIZE,
    height: CARD_THUMB_SIZE * 0.7,
    position: 'relative',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceDark,
  },
  cardPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRank: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimaryDark,
    flex: 1,
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.textSecondaryDark,
    marginTop: 3,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondaryDark,
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  voteText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // ─── Empty ───
  emptyText: {
    fontSize: 13,
    color: Colors.textMutedDark,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
