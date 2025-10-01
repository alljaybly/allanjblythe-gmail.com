import { useState, useEffect, useCallback } from 'react';
import { get as getFromCache, set as setInCache } from 'idb-keyval';
import { WEB_PLATFORM_DASHBOARD_API } from '../constants';
import { DashboardFeature } from '../types';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  timestamp: number;
  data: DashboardFeature[];
}

interface UseDashboardAPIState {
  data: DashboardFeature[] | null;
  error: Error | null;
  isLoading: boolean;
  isOffline: boolean;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDashboardAPI(initialEndpoint: string | null) {
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const [state, setState] = useState<UseDashboardAPIState>({
    data: null,
    error: null,
    isLoading: !!initialEndpoint,
    isOffline: false,
  });

  const fetchData = useCallback(async (currentEndpoint: string) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null, isOffline: false }));
    const cacheKey = `api-cache:${currentEndpoint}`;

    try {
      const cached = await getFromCache<CachedData>(cacheKey);
      if (cached) {
        setState(prevState => ({ ...prevState, data: cached.data }));
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
           setState(prevState => ({ ...prevState, isLoading: false }));
           return;
        }
      }
    } catch (e) { console.error("Cache read failed", e); }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`${WEB_PLATFORM_DASHBOARD_API}${currentEndpoint}`);
        if (!response.ok) throw new Error(`API Request Failed: ${response.status}`);
        
        const responseData = await response.json();
        
        // The API response nests the features array. This is now robustly handled.
        const featuresArray = Array.isArray(responseData.features) ? responseData.features : [];

        const cacheEntry: CachedData = { timestamp: Date.now(), data: featuresArray };
        await setInCache(cacheKey, cacheEntry);

        setState({ data: featuresArray, error: null, isLoading: false, isOffline: false });
        return;
      } catch (err) {
        lastError = err as Error;
        if (attempt < 2) await sleep(1000 * Math.pow(2, attempt));
      }
    }

    console.error("API fetch failed after multiple retries:", lastError);
    const cached = await getFromCache<CachedData>(cacheKey);
    if (cached) {
      setState({ data: cached.data, error: lastError, isLoading: false, isOffline: true });
    } else {
      // Fallback to an empty array on total failure to prevent .slice() errors.
      setState({ data: [], error: lastError, isLoading: false, isOffline: false });
    }
  }, []);

  useEffect(() => {
    if (endpoint) {
      // Debounce fetch to avoid rapid calls
      const debouncedFetch = setTimeout(() => fetchData(endpoint), 300);
      return () => clearTimeout(debouncedFetch);
    } else {
      setState(prevState => ({ ...prevState, data: null, error: null, isLoading: false }));
    }
  }, [endpoint, fetchData]);

  return { ...state, setEndpoint };
}
