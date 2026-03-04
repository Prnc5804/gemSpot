/**
 * ProductCard — Shop item card with image, name, price, rating, buy button
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { ShopItem } from '@/constants/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProductCardProps {
    item: ShopItem;
    onPress?: () => void;
}

export function ProductCard({ item, onPress }: ProductCardProps) {
    const cardScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    return (
        <AnimatedPressable
            style={[styles.card, Shadows.lg, animStyle]}
            onPress={onPress}
            onPressIn={() => { cardScale.value = withSpring(Animation.pressScale, Animation.spring); }}
            onPressOut={() => { cardScale.value = withSpring(1, Animation.spring); }}
        >
            {item.isBestSeller && (
                <View style={styles.bestSellerBadge}>
                    <Ionicons name="star" size={10} color={Colors.white} />
                    <Text style={styles.bestSellerText}>Best Seller</Text>
                </View>
            )}

            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>

                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= Math.floor(item.rating) ? 'star' : star <= item.rating + 0.5 ? 'star-half' : 'star-outline'}
                            size={12}
                            color={Colors.accent}
                        />
                    ))}
                    <Text style={styles.reviewCount}>({item.reviewCount.toLocaleString()})</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    {item.originalPrice && (
                        <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                    )}
                </View>

                <Pressable style={styles.buyBtn}>
                    <Ionicons name="cart-outline" size={14} color={Colors.white} />
                    <Text style={styles.buyText}>Buy Now</Text>
                </Pressable>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        width: 170,
        marginRight: Spacing.sm,
    },
    bestSellerBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.accent,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    bestSellerText: {
        ...Typography.badge,
        color: Colors.white,
        fontSize: 9,
    },
    image: {
        width: '100%',
        height: 130,
        backgroundColor: Colors.surfaceDark,
    },
    info: {
        padding: Spacing.sm,
    },
    name: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
        fontSize: 14,
    },
    description: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: Spacing.xs,
    },
    reviewCount: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        fontSize: 10,
        marginLeft: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.xs,
    },
    price: {
        ...Typography.cardTitle,
        color: Colors.accent,
        fontSize: 15,
    },
    originalPrice: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        textDecorationLine: 'line-through',
    },
    buyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        marginTop: Spacing.sm,
    },
    buyText: {
        ...Typography.button,
        color: Colors.white,
        fontSize: 12,
    },
});
