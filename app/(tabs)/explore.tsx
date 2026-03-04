/**
 * Discover Screen — Search, filter, and browse video grid
 * Filters are pinned at top, only the video grid scrolls
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Layout } from '@/constants/theme';
import { CATEGORIES, SUBSCRIBER_RANGES, type Category, type SubscriberRange, type SortOption } from '@/constants/types';
import { MOCK_VIDEOS } from '@/constants/mock-data';
import { VideoCard } from '@/components/video-card';
import { CategoryChip } from '@/components/category-chip';
import { SearchBar } from '@/components/search-bar';
import { EmptyState } from '@/components/empty-state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SORT_OPTIONS: SortOption[] = ['Most Votes', 'Newest', 'Trending'];

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('Most Votes');
  const [selectedSubRange, setSelectedSubRange] = useState<SubscriberRange | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let result = [...MOCK_VIDEOS];

    if (search.length > 0) {
      const q = search.toLowerCase();
      result = result.filter((v) =>
        v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((v) => v.category === selectedCategory);
    }

    if (selectedSubRange) {
      const maxSubs = {
        'Under 100': 100,
        'Under 500': 500,
        'Under 1K': 1000,
        'Under 5K': 5000,
      }[selectedSubRange];
      result = result.filter((v) => v.subscriberCount < maxSubs);
    }

    if (selectedSort === 'Most Votes') {
      result.sort((a, b) => b.voteCount - a.voteCount);
    } else if (selectedSort === 'Newest') {
      result.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    } else if (selectedSort === 'Trending') {
      result = result.filter((v) => v.isTrending);
    }

    return result;
  }, [search, selectedCategory, selectedSort, selectedSubRange]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ─── FIXED FILTER SECTION (stays pinned at top) ─── */}
      <View style={styles.filterSection}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Discover</Text>
          <Text style={styles.resultCount}>{filtered.length} gems found</Text>
        </View>

        {/* Search */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Sort Pills */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.sortPill, selectedSort === opt && styles.sortPillActive]}
              onPress={() => setSelectedSort(opt)}
            >
              <Text style={[styles.sortText, selectedSort === opt && styles.sortTextActive]}>{opt}</Text>
            </Pressable>
          ))}
        </View>

        {/* Category Chips — single scrollable row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScrollView}
          contentContainerStyle={styles.chipRow}
        >
          <CategoryChip
            name="All"
            emoji="✨"
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

        {/* Subscriber Range Filter — separate scrollable row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subRangeScrollView}
          contentContainerStyle={styles.subRangeRow}
        >
          {SUBSCRIBER_RANGES.map((item) => (
            <Pressable
              key={item}
              style={[styles.subRangeChip, selectedSubRange === item && styles.subRangeActive]}
              onPress={() => setSelectedSubRange(selectedSubRange === item ? null : item)}
            >
              <Ionicons name="people-outline" size={12} color={selectedSubRange === item ? Colors.white : Colors.textMutedDark} />
              <Text style={[styles.subRangeText, selectedSubRange === item && styles.subRangeTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ─── SCROLLABLE VIDEO GRID (fills remaining space) ─── */}
      <FlatList
        data={filtered}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1500);
          }} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <VideoCard
              video={item}
              compact
              onPress={() => router.push(`/video/${item.id}` as any)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No gems found"
            subtitle="Try adjusting your filters or search query"
          />
        }
        ListFooterComponent={<View style={{ height: Layout.tabBarHeight + Spacing.xl }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  filterSection: {
    backgroundColor: Colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
    paddingBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  screenTitle: {
    ...Typography.screenTitle,
    color: Colors.textPrimaryDark,
  },
  resultCount: {
    ...Typography.caption,
    color: Colors.textMutedDark,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  sortPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  sortPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortText: {
    ...Typography.body,
    color: Colors.textSecondaryDark,
    fontSize: 13,
  },
  sortTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  chipScrollView: {
    height: 44,
    flexGrow: 0,
  },
  chipRow: {
    paddingHorizontal: Layout.screenPadding,
    alignItems: 'center',
  },
  subRangeScrollView: {
    height: 38,
    flexGrow: 0,
    marginBottom: Spacing.xs,
  },
  subRangeRow: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  subRangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  subRangeActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  subRangeText: {
    ...Typography.caption,
    color: Colors.textMutedDark,
  },
  subRangeTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  grid: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
  },
  gridRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
});
