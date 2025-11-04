import { useState, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

// Simple in-memory cache
const cache = new Map();
const CACHE_SIZE_LIMIT = 50;

function useApi() {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef(null);

  // Cache management
  const getCacheKey = (url, options) => {
    return `${options.method || "GET"}-${url}`;
  };

  const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      // 10 minutes
      return cached.data;
    }
    cache.delete(key);
    return null;
  };

  const setCachedData = (key, data) => {
    if (cache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, { data, timestamp: Date.now() });
  };

  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  // Enhanced API call with retry, timeout, and cancellation
  const apiCall = useCallback(
    async (url, options = {}) => {
      const {
        retries = 3,
        timeout = 10000,
        useCache = true,
        noCancel = false,
        ...fetchOptions
      } = options;

      // Cancel previous request if still pending and not disabled
      if (!noCancel && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const cacheKey = getCacheKey(url, fetchOptions);

      // Check cache for GET requests
      if (fetchOptions.method === "GET" && useCache) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }

      setLoading(true);
      setError("");

      const makeRequest = async (attempt = 0) => {
        try {
          const response = await Promise.race([
            fetch(url, {
              ...fetchOptions,
              headers: {
                ...getAuthHeaders(),
                ...fetchOptions.headers,
              },
              signal: abortController.signal,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), timeout)
            ),
          ]);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
            error.status = response.status;
            error.data = errorData;
            throw error;
          }

          const data = await response.json();

          // Cache successful GET responses
          if (fetchOptions.method === "GET" && useCache) {
            setCachedData(cacheKey, data);
          }

          return data;
        } catch (err) {
          if (err.name === "AbortError") {
            // Don't throw error for cancelled requests, just return silently
            return null;
          }

          // Retry logic for network errors and 5xx status codes
          if (
            attempt < retries &&
            (err.message.includes("fetch") ||
              err.message.includes("network") ||
              (err.status >= 500 && err.status < 600))
          ) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay));
            return makeRequest(attempt + 1);
          }

          throw err;
        }
      };

      try {
        const result = await makeRequest();
        // If request was cancelled, don't process the result and don't update state
        if (result === null) {
          return;
        }
        return result;
      } catch (err) {
        setError(err.message);
        console.error("API Error:", err);
        throw err;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [getAuthHeaders]
  );

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    apiCall,
    cancelRequest,
    clearCache,
  };
}

export default useApi;
