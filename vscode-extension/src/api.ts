import fetch from 'node-fetch';
import { DashboardFeature } from './types';

const WEB_PLATFORM_DASHBOARD_API = 'https://api.webstatus.dev/v1/features';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
    timestamp: number;
    data: DashboardFeature[];
}

let cache: CacheEntry | null = null;

export async function getFeatureMap(): Promise<DashboardFeature[]> {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        return cache.data;
    }

    try {
        const response = await fetch(WEB_PLATFORM_DASHBOARD_API);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const data = (await response.json()) as { features: DashboardFeature[] };
        const features = Array.isArray(data.features) ? data.features : [];

        cache = {
            timestamp: Date.now(),
            data: features,
        };

        return features;
    } catch (error) {
        console.error('Failed to fetch feature map:', error);
        // On failure, return cached data if available, otherwise throw
        if (cache) {
            return cache.data;
        }
        throw error;
    }
}
