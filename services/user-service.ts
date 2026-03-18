/**
 * User Service — Profile, streak, XP management (JS SDK)
 */

import { db } from './firebase';
import {
    doc,
    getDoc,
    getDocs,
    updateDoc,
    increment,
    collection,
    query,
    orderBy,
} from 'firebase/firestore';
import type { User } from '@/constants/types';

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: userId } as User;
}

/**
 * Add XP to user — handles level-up logic
 */
export async function addXP(userId: string, amount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { leveledUp: false, newLevel: 1 };

    const user = snap.data() as User;
    let newXP = user.xp + amount;
    let newLevel = user.level;
    let newXPToNext = user.xpToNext;
    let leveledUp = false;

    while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = Math.floor(newXPToNext * 1.5);
        leveledUp = true;
    }

    await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        xpToNext: newXPToNext,
        points: increment(amount),
    });

    return { leveledUp, newLevel };
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
    });

    return { allowed: true, remaining: user.maxVotesPerDay - user.votesToday - 1 };
}

/**
 * Get accurate rank of a user by checking their points compared to others
 */
export async function getUserRank(userId: string): Promise<number> {
    const usersRef = collection(db, 'users');
    // For a real app with thousands of users, doing clientside count or a full query is expensive,
    // but for our purposes we'll fetch ordered by points and find the index.
    const q = query(usersRef, orderBy('points', 'desc'));
    const snap = await getDocs(q);
    
    let rank = 1;
    for (const doc of snap.docs) {
        if (doc.id === userId) return rank;
        rank++;
    }
    return -1; // Not found
}
