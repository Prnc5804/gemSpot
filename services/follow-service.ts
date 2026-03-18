/**
 * Follow Service — Follow/unfollow users, get followers/following (JS SDK)
 */

import {
    deleteDoc,
    doc,
    getDoc,
    increment,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Follow a user. Prevents duplicate follows via compound doc ID.
 */
export async function followUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    if (followerId === followingId) {
        return { success: false, error: 'Cannot follow yourself' };
    }

    const followDocId = `${followerId}_${followingId}`;
    const followRef = doc(db, 'follows', followDocId);

    try {
        const existing = await getDoc(followRef);
        if (existing.exists()) {
            return { success: false, error: 'Already following this user' };
        }

        await setDoc(followRef, {
            followerId,
            followingId,
            createdAt: serverTimestamp(),
        });

        // Increment counters
        await updateDoc(doc(db, 'users', followerId), {
            following: increment(1),
        });
        await updateDoc(doc(db, 'users', followingId), {
            followers: increment(1),
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to follow' };
    }
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    const followDocId = `${followerId}_${followingId}`;
    const followRef = doc(db, 'follows', followDocId);

    try {
        const existing = await getDoc(followRef);
        if (!existing.exists()) {
            return { success: false, error: 'Not following this user' };
        }

        await deleteDoc(followRef);

        // Decrement counters
        await updateDoc(doc(db, 'users', followerId), {
            following: increment(-1),
        });
        await updateDoc(doc(db, 'users', followingId), {
            followers: increment(-1),
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to unfollow' };
    }
}

/**
 * Check if a user is following another user.
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const followDocId = `${followerId}_${followingId}`;
    const snap = await getDoc(doc(db, 'follows', followDocId));
    return snap.exists();
}

/**
 * Get follower count for a user (reads from user doc).
 */
export async function getFollowerCount(userId: string): Promise<number> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return 0;
    return snap.data()?.followers || 0;
}

/**
 * Get following count for a user (reads from user doc).
 */
export async function getFollowingCount(userId: string): Promise<number> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return 0;
    return snap.data()?.following || 0;
}
