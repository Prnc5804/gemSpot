/**
 * Video Service — Submit, query, and vote on videos (JS SDK)
 */

import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    increment,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { getOrCreateCreator } from './creator-service';
import { fetchVideoInfo, isEligible } from './youtube-service';
import type { Video, Category, SortOption, SubscriberRange } from '@/constants/types';

export interface SubmitVideoInput {
    youtubeUrl: string;
    category: Category;
    description: string;
    submittedBy: string;
    mode: 'creator' | 'gem';
    channelUrl?: string;
}

export interface SubmitResult {
    success: boolean;
    videoId?: string;
    creatorId?: string;
    creatorClaimed?: boolean;
    error?: string;
    subscriberCheck?: 'pass' | 'fail';
    duplicateCheck?: 'pass' | 'fail';
}

/**
 * Submit a video — handles YouTube extraction, creator auto-creation, eligibility checks
 */
export async function submitVideo(input: SubmitVideoInput): Promise<SubmitResult> {
    try {
        const videoInfo = await fetchVideoInfo(input.youtubeUrl);
        if (!videoInfo) {
            return { success: false, error: 'Invalid YouTube URL' };
        }

        if (!isEligible(videoInfo.subscriberCount)) {
            return { success: false, error: 'Creator has more than 5K subscribers', subscriberCheck: 'fail' };
        }

        const dupeQuery = query(
            collection(db, 'videos'),
            where('youtubeVideoId', '==', videoInfo.videoId)
        );
        const dupeSnap = await getDocs(dupeQuery);
        if (!dupeSnap.empty) {
            return { success: false, error: 'This video has already been submitted', duplicateCheck: 'fail' };
        }

        const creator = await getOrCreateCreator(
            videoInfo.channelId,
            {
                channelUrl: input.channelUrl || `https://youtube.com/channel/${videoInfo.channelId}`,
                name: videoInfo.channelName,
                avatar: videoInfo.channelAvatar,
                subscriberCount: videoInfo.subscriberCount,
            }
        );

        const videoRef = doc(collection(db, 'videos'));
        const videoDoc = {
            id: videoRef.id,
            youtubeVideoId: videoInfo.videoId,
            title: videoInfo.title || input.description,
            description: input.description,
            category: input.category,
            thumbnailUrl: videoInfo.thumbnailUrl,
            creatorId: creator.id,
            creatorName: creator.name,
            creatorAvatar: creator.avatar,
            subscriberCount: videoInfo.subscriberCount,
            voteCount: 0,
            voters: [],
            commentCount: 0,
            viewsFromPlatform: 0,
            ratings: { editing: 0, audio: 0, content: 0, average: 0 },
            submittedBy: input.submittedBy,
            submittedAt: new Date().toISOString(),
            isFeatured: false,
            isTrending: false,
            isGemOfDay: false,
            tags: [],
            createdAt: serverTimestamp(),
        };

        await setDoc(videoRef, videoDoc);

        await updateDoc(doc(db, 'creators', creator.id), {
            videosCount: increment(1),
        });

        return {
            success: true,
            videoId: videoRef.id,
            creatorId: creator.id,
            creatorClaimed: creator.claimed,
            subscriberCheck: 'pass',
            duplicateCheck: 'pass',
        };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to submit video' };
    }
}

/**
 * Vote on a video (toggle — one vote per user)
 */
export async function voteVideo(videoId: string, userId: string): Promise<{ success: boolean; newCount: number }> {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
        return { success: false, newCount: 0 };
    }

    const videoData = videoSnap.data();
    const voters: string[] = videoData?.voters || [];

    if (voters.includes(userId)) {
        await updateDoc(videoRef, {
            voteCount: increment(-1),
            voters: arrayRemove(userId),
        });
        if (videoData?.creatorId) {
            await updateDoc(doc(db, 'creators', videoData.creatorId), {
                totalVotes: increment(-1),
            });
        }
        return { success: true, newCount: (videoData?.voteCount || 1) - 1 };
    } else {
        await updateDoc(videoRef, {
            voteCount: increment(1),
            voters: arrayUnion(userId),
        });
        if (videoData?.creatorId) {
            await updateDoc(doc(db, 'creators', videoData.creatorId), {
                totalVotes: increment(1),
            });
        }
        return { success: true, newCount: (videoData?.voteCount || 0) + 1 };
    }
}

/**
 * Get videos with filtering and sorting
 */
export async function getVideos(options?: {
    category?: Category;
    sort?: SortOption;
    subscriberRange?: SubscriberRange;
    limitCount?: number;
    trendingOnly?: boolean;
    gemOfDayOnly?: boolean;
}): Promise<Video[]> {
    let q = query(collection(db, 'videos'));

    if (options?.category) {
        q = query(q, where('category', '==', options.category));
    }
    if (options?.trendingOnly) {
        q = query(q, where('isTrending', '==', true));
    }
    if (options?.gemOfDayOnly) {
        q = query(q, where('isGemOfDay', '==', true));
    }
    if (options?.sort === 'Most Votes') {
        q = query(q, orderBy('voteCount', 'desc'));
    } else {
        q = query(q, orderBy('createdAt', 'desc'));
    }
    if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
    }

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];

    if (options?.subscriberRange) {
        const maxSubs: Record<string, number> = {
            'Under 100': 100, 'Under 500': 500, 'Under 1K': 1000, 'Under 5K': 5000,
        };
        const max = maxSubs[options.subscriberRange];
        results = results.filter((v) => v.subscriberCount < max);
    }

    return results;
}

/**
 * Get a single video by ID
 */
export async function getVideoById(videoId: string): Promise<Video | null> {
    const snap = await getDoc(doc(db, 'videos', videoId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as Video;
}
