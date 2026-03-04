/**
 * Brand Deals Screen — Active campaigns, details, and apply flow
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Layout } from '@/constants/theme';
import { MOCK_CAMPAIGNS } from '@/constants/mock-data';
import { CampaignCard } from '@/components/campaign-card';
import { EmptyState } from '@/components/empty-state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DealFilter = 'all' | 'active' | 'applied' | 'completed';

export default function BrandDealsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState<DealFilter>('all');

    const filters: { key: DealFilter; label: string }[] = [
        { key: 'all', label: 'All Deals' },
        { key: 'active', label: 'Active' },
        { key: 'applied', label: 'Applied' },
        { key: 'completed', label: 'Completed' },
    ];

    const filteredCampaigns = filter === 'all'
        ? MOCK_CAMPAIGNS
        : MOCK_CAMPAIGNS.filter((c) => c.status === filter);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
                <Text style={styles.headerTitle}>🤝 Brand Deals</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={18} color={Colors.info} />
                <Text style={styles.infoText}>
                    Apply to brand campaigns, create content, and earn! Platform takes 10-20% commission.
                </Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {filters.map((f) => (
                    <Pressable
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))
                ) : (
                    <EmptyState
                        icon="briefcase-outline"
                        title="No campaigns found"
                        subtitle={filter === 'applied'
                            ? "You haven't applied to any deals yet. Browse active campaigns to get started! 🚀"
                            : "Campaigns coming soon! Check back regularly."}
                        actionLabel={filter === 'applied' ? 'Browse Deals' : undefined}
                        onAction={filter === 'applied' ? () => setFilter('all') : undefined}
                    />
                )}
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
    infoBanner: {
        flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
        backgroundColor: Colors.info + '15', marginHorizontal: Layout.screenPadding,
        padding: Spacing.sm + 4, borderRadius: Radius.md, marginBottom: Spacing.sm,
    },
    infoText: { ...Typography.caption, color: Colors.info, flex: 1, lineHeight: 18 },
    filterRow: { paddingHorizontal: Layout.screenPadding, gap: Spacing.sm, paddingBottom: Spacing.sm },
    filterChip: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.full, backgroundColor: Colors.cardDark,
        borderWidth: 1, borderColor: Colors.borderDark,
    },
    filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterText: { ...Typography.body, color: Colors.textSecondaryDark, fontSize: 13 },
    filterTextActive: { color: Colors.white, fontWeight: '600' },
    scrollContent: { paddingHorizontal: Layout.screenPadding },
});
