/**
 * User Service — Profile, streak management (JS SDK)
 * XP/points system removed per requirements.
 */

import type { User } from '@/constants/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: userId } as User;
}

/**
 * Update daily streak
 */
export async function updateStreak(userId: string): Promise<number> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return 0;

    const user = snap.data() as any;
    const now = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

    let newStreak = user.streak || 0;

    if (lastActive) {
        const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 1;
        }
        // diffDays === 0 means same day, streak stays the same
    } else {
        newStreak = 1;
    }

    await updateDoc(userRef, {
        streak: newStreak,
        lastActiveDate: now.toISOString(),
        votesToday: user.lastActiveDate &&
            new Date(user.lastActiveDate).toDateString() === now.toDateString()
            ? user.votesToday
            : 0,
    });

    return newStreak;
}

/**
 * Increment vote count for today
 */
export async function incrementVoteCount(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { allowed: false, remaining: 0 };

    const user = snap.data() as User;

    if (user.votesToday >= user.maxVotesPerDay) {
        return { allowed: false, remaining: 0 };
    }

    await updateDoc(userRef, {
        votesToday: increment(1),
        lifetimeVotes: increment(1),
    });

    return { allowed: true, remaining: user.maxVotesPerDay - user.votesToday - 1 };
}

/**
 * Get rank of a user by checking their post count / followers compared to others
 */
export async function getUserRank(userId: string): Promise<number> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('followers', 'desc'));
    const snap = await getDocs(q);

    let rank = 1;
    for (const doc of snap.docs) {
        if (doc.id === userId) return rank;
        rank++;
    }
    return -1; // Not found
}
