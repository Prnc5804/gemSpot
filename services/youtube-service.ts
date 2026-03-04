/**
 * YouTube Service — Extract video/channel info from YouTube URLs
 * Mock implementation — swap with real YouTube Data API v3 later
 */

export interface YouTubeVideoInfo {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    channelId: string;
    channelName: string;
    channelAvatar: string;
    subscriberCount: number;
    description: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Extract YouTube channel ID from URL
 */
export function extractYouTubeChannelId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/channel\/)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/@)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/c\/)([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Mock: Fetch video info from YouTube URL
 * In production, replace with real YouTube Data API v3 call
 */
export async function fetchVideoInfo(youtubeUrl: string): Promise<YouTubeVideoInfo | null> {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) return null;

    // ─── MOCK RESPONSE ─────────────────────────────────
    // Replace this entire block with a real API call:
    //
    // const response = await fetch(
    //   `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    // );
    // const data = await response.json();
    // const video = data.items[0];
    //
    // Then fetch channel info:
    // const channelResponse = await fetch(
    //   `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${video.snippet.channelId}&key=${YOUTUBE_API_KEY}`
    // );

    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    return {
        videoId,
        title: `Video ${videoId.slice(0, 6)}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelId: `UC_mock_${videoId.slice(0, 8)}`,
        channelName: 'MockCreator',
        channelAvatar: `https://ui-avatars.com/api/?name=MC&background=10B981&color=fff&size=128`,
        subscriberCount: Math.floor(Math.random() * 4500) + 100,
        description: 'Auto-extracted video from YouTube',
    };
}

/**
 * Mock: Fetch channel info from channel URL
 */
export async function fetchChannelInfo(channelUrl: string): Promise<{
    channelId: string;
    channelName: string;
    channelAvatar: string;
    subscriberCount: number;
} | null> {
    const channelId = extractYouTubeChannelId(channelUrl);
    if (!channelId) return null;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        channelId: `UC_${channelId}`,
        channelName: channelId.replace('@', ''),
        channelAvatar: `https://ui-avatars.com/api/?name=${channelId.slice(0, 2)}&background=10B981&color=fff&size=128`,
        subscriberCount: Math.floor(Math.random() * 4500) + 100,
    };
}

/**
 * Check if subscriber count is under 5K
 */
export function isEligible(subscriberCount: number): boolean {
    return subscriberCount < 5000;
}
