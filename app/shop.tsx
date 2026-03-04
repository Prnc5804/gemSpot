/**
 * Creator Shop — Affiliate gear marketplace with categories
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { MOCK_SHOP_ITEMS } from '@/constants/mock-data';
import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { EmptyState } from '@/components/empty-state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ShopCategory } from '@/constants/types';

const SHOP_CATEGORIES: { name: ShopCategory | 'All'; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'All', icon: 'grid' },
    { name: 'Microphones', icon: 'mic' },
    { name: 'Cameras', icon: 'camera' },
    { name: 'Lighting', icon: 'sunny' },
    { name: 'Tripods', icon: 'easel' },
    { name: 'Editing Tools', icon: 'color-palette' },
    { name: 'Starter Kits', icon: 'gift' },
];

export default function ShopScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'All'>('All');
    const [search, setSearch] = useState('');

    const filtered = MOCK_SHOP_ITEMS.filter((item) => {
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = search.length === 0 || item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
                <Text style={styles.headerTitle}>🛒 Creator Shop</Text>
                <View style={{ width: 40 }} />
            </View>

            <SearchBar value={search} onChangeText={setSearch} placeholder="Search gear..." />

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {SHOP_CATEGORIES.map((cat) => (
                    <Pressable
                        key={cat.name}
                        style={[styles.catChip, selectedCategory === cat.name && styles.catChipActive]}
                        onPress={() => setSelectedCategory(cat.name)}
                    >
                        <Ionicons
                            name={cat.icon}
                            size={16}
                            color={selectedCategory === cat.name ? Colors.white : Colors.textMutedDark}
                        />
                        <Text style={[styles.catText, selectedCategory === cat.name && styles.catTextActive]}>
                            {cat.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Starter Kit Banner */}
                {(selectedCategory === 'All' || selectedCategory === 'Starter Kits') && (
                    <Pressable style={[styles.kitBanner, Shadows.lg]}>
                        <View style={styles.kitInfo}>
                            <Text style={styles.kitTitle}>🎁 Creator Starter Kit</Text>
                            <Text style={styles.kitSubtitle}>Everything you need to start creating</Text>
                            <Text style={styles.kitPrice}>$149.99 <Text style={styles.kitOriginal}>$199.99</Text></Text>
                        </View>
                        <View style={styles.kitBadge}>
                            <Ionicons name="star" size={12} color={Colors.white} />
                            <Text style={styles.kitBadgeText}>Save 25%</Text>
                        </View>
                    </Pressable>
                )}

                {/* Product Grid */}
                <View style={styles.productGrid}>
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <View key={item.id} style={styles.productItem}>
                                <ProductCard item={item} />
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            icon="cart-outline"
                            title="No products found"
                            subtitle="Try a different category or search term"
                        />
                    )}
                </View>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.backgroundDark },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { ...Typography.sectionTitle, color: Colors.textPrimaryDark },
    catRow: {
        paddingHorizontal: Layout.screenPadding, gap: Spacing.sm,
        paddingVertical: Spacing.sm,
    },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.sm + 4, paddingVertical: Spacing.sm,
        borderRadius: Radius.full, backgroundColor: Colors.cardDark,
        borderWidth: 1, borderColor: Colors.borderDark,
    },
    catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    catText: { ...Typography.caption, color: Colors.textMutedDark, fontWeight: '500' },
    catTextActive: { color: Colors.white, fontWeight: '600' },
    scrollContent: { paddingHorizontal: Layout.screenPadding },
    kitBanner: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.accent + '40',
        position: 'relative',
    },
    kitInfo: {},
    kitTitle: { ...Typography.sectionTitle, color: Colors.textPrimaryDark },
    kitSubtitle: { ...Typography.body, color: Colors.textSecondaryDark, marginTop: 4 },
    kitPrice: { ...Typography.screenTitle, color: Colors.accent, marginTop: Spacing.sm, fontSize: 20 },
    kitOriginal: { ...Typography.caption, color: Colors.textMutedDark, textDecorationLine: 'line-through', fontSize: 14 },
    kitBadge: {
        position: 'absolute', top: Spacing.sm, right: Spacing.sm,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.accent, paddingHorizontal: Spacing.sm,
        paddingVertical: 4, borderRadius: Radius.full,
    },
    kitBadgeText: { ...Typography.badge, color: Colors.white },
    productGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    productItem: {
        width: '48%',
    },
});
