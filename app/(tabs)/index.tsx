import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import { CATEGORIES } from '@/constants/types';
import { MOCK_VIDEOS, MOCK_CREATORS, MOCK_CAMPAIGNS, MOCK_SHOP_ITEMS } from '@/constants/mock-data';
import { VideoCard } from '@/components/video-card';
import { CreatorCard } from '@/components/creator-card';
import { CategoryChip } from '@/components/category-chip';
import { SectionHeader } from '@/components/section-header';
import { CampaignCard } from '@/components/campaign-card';
import { ProductCard } from '@/components/product-card';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '@/services/firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import type { Video, Creator } from '@/constants/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [allCreators, setAllCreators] = useState<Creator[]>(MOCK_CREATORS);

  const fetchData = async () => {
    try {
      // Fetch videos from Firestore
      const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(30));
      const videosSnap = await getDocs(videosQuery);
      const firestoreVideos = videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];

      // Fetch creators
      const creatorsQuery = query(collection(db, 'creators'), orderBy('totalVotes', 'desc'), limit(10));
      const creatorsSnap = await getDocs(creatorsQuery);
      const firestoreCreators = creatorsSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Creator[];

      // Combine Firestore data with mock data (Firestore first)
      const combinedVideos = [...firestoreVideos, ...MOCK_VIDEOS.filter(
        mv => !firestoreVideos.some(fv => fv.id === mv.id)
      )];
      const combinedCreators = [...firestoreCreators, ...MOCK_CREATORS.filter(
        mc => !firestoreCreators.some(fc => fc.id === mc.id)
      )];

      setAllVideos(combinedVideos);
      setAllCreators(combinedCreators);
    } catch (error) {
      console.log('Firestore fetch failed, using mock data:', error);
      // Keep mock data as fallback
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const gemOfDay = allVideos.find((v) => v.isGemOfDay) || allVideos[0];
  const trendingVideos = allVideos.filter((v) => v.isTrending).length > 0
    ? allVideos.filter((v) => v.isTrending)
    : allVideos.slice(0, 4);
  const newUploads = allVideos.slice().sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  const topCreators = allCreators.slice(0, 6);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            Gem<Text style={styles.logoAccent}>Spots</Text>
          </Text>
          <Text style={styles.tagline}>Discover hidden creators</Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={Colors.textPrimaryDark} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimaryDark} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Hidden Gem of the Day */}
        {gemOfDay && (
          <View style={styles.gemSection}>
            <SectionHeader title="Hidden Gem of the Day" emoji="⭐" showSeeAll={false} />
            <Pressable
              style={styles.gemCard}
              onPress={() => router.push(`/video/${gemOfDay.id}` as any)}
            >
              <Image source={{ uri: gemOfDay.thumbnailUrl }} style={styles.gemImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.gemGradient}
              >
                <View style={styles.gemBadge}>
                  <Text style={styles.gemBadgeText}>💎 GEM OF THE DAY</Text>
                </View>
                <Text style={styles.gemTitle}>{gemOfDay.title}</Text>
                <View style={styles.gemCreator}>
                  <Image source={{ uri: gemOfDay.creatorAvatar }} style={styles.gemAvatar} />
                  <Text style={styles.gemCreatorName}>{gemOfDay.creatorName}</Text>
                  <View style={styles.gemDot} />
                  <Ionicons name="chevron-up" size={14} color={Colors.primary} />
                  <Text style={styles.gemVotes}>{gemOfDay.voteCount}</Text>
                </View>
              </LinearGradient>
              <View style={styles.playBtnOverlay}>
                <View style={[styles.playBtn, Shadows.glow(Colors.primary)]}>
                  <Ionicons name="play" size={24} color={Colors.white} />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Categories */}
        <SectionHeader title="Categories" emoji="📂" showSeeAll={false} />
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

        {/* Trending Videos */}
        <SectionHeader title="Trending Videos" emoji="🔥" onSeeAll={() => router.push('/explore')} />
        <FlatList
          data={trendingVideos}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              compact
              onPress={() => router.push(`/video/${item.id}` as any)}
            />
          )}
        />

        {/* New Uploads */}
        <SectionHeader title="New Uploads" emoji="🆕" onSeeAll={() => router.push('/explore')} />
        <FlatList
          data={newUploads.slice(0, 5)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              compact
              onPress={() => router.push(`/video/${item.id}` as any)}
            />
          )}
        />

        {/* Top Creators This Week */}
        <SectionHeader title="Top Creators This Week" emoji="🏆" onSeeAll={() => router.push('/leaderboard')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {topCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              variant="compact"
              onPress={() => { }}
            />
          ))}
        </ScrollView>

        {/* Brand Deals Highlight */}
        <SectionHeader title="Brand Deals" emoji="🤝" onSeeAll={() => router.push('/brand-deals')} />
        <FlatList
          data={MOCK_CAMPAIGNS.slice(0, 3)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              compact
              onPress={() => router.push('/brand-deals')}
            />
          )}
        />

        {/* Creator Shop Preview */}
        <SectionHeader title="Creator Gear" emoji="🛒" onSeeAll={() => router.push('/shop')} />
        <FlatList
          data={MOCK_SHOP_ITEMS.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={() => router.push('/shop')} />
          )}
        />

        {/* Bottom padding for tab bar */}
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
  logo: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: Colors.textPrimaryDark,
    letterSpacing: -1,
  },
  logoAccent: {
    color: Colors.primary,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textMutedDark,
    marginTop: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.backgroundDark,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  gemSection: {
    marginTop: Spacing.sm,
  },
  gemCard: {
    marginHorizontal: Layout.screenPadding,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
    ...Shadows.lg,
  },
  gemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceDark,
  },
  gemGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  gemBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  gemBadgeText: {
    ...Typography.badge,
    color: Colors.white,
    letterSpacing: 1,
  },
  gemTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  gemCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  gemAvatar: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  gemCreatorName: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '500',
  },
  gemDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  gemVotes: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  playBtnOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipRow: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
  },
  horizontalList: {
    paddingHorizontal: Layout.screenPadding,
  },
});
