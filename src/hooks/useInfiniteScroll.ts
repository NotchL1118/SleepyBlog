"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getArticleList } from "@/actions/article";
import type { IArticle } from "@/types/article";
import type { ServerActionResponse } from "@/types/server-actions-response";
import type { PaginatedData } from "@/types/server-actions-response";
import { RefObject } from "react";

/**
 * Infinite scroll hook for loading articles with pagination
 */
export function useInfiniteScroll(params: {
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
}): {
  articles: IArticle[];
  isLoading: boolean;
  isInitialLoading: boolean;
  hasMore: boolean;
  total: number;
  error: string | null;
  sentinelRef: RefObject<HTMLDivElement | null>;
} {
  // State management
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Refs
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Extract params
  const { limit = 10, search, category, tag } = params;

  /**
   * Fetch articles from server
   */
  const fetchArticles = useCallback(async (page: number, reset = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const response: ServerActionResponse<PaginatedData<IArticle>> = await getArticleList({
        page,
        limit,
        status: "published",
        search,
        category,
        tag,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch articles");
      }

      const data = response.data;
      const newArticles = data.items;

      if (reset) {
        setArticles(newArticles);
        setCurrentPage(page);
        setHasMore(data.pagination.hasNext);
      } else {
        setArticles((prev) => {
          // Avoid duplicate articles based on slug
          const existingSlugs = new Set(prev.map((article) => article.slug));
          const uniqueNewArticles = newArticles.filter(
            (article) => !existingSlugs.has(article.slug)
          );
          return [...prev, ...uniqueNewArticles];
        });
        setCurrentPage(page);
        setHasMore(data.pagination.hasNext);
      }

      setTotal(data.pagination.total);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Failed to fetch articles:", err);
        setError(err.message || "加载文章失败，请稍后重试");
      }
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [limit, search, category, tag]);

  /**
   * Load more articles (next page)
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      fetchArticles(nextPage);
    }
  }, [isLoading, hasMore, currentPage, fetchArticles]);

  /**
   * Intersection Observer callback
   */
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  /**
   * Setup Intersection Observer
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  /**
   * Handle initial load and parameter changes with debounce
   */
  useEffect(() => {
    // First render: load immediately without debounce
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchArticles(1, true);
      return;
    }

    // Subsequent parameter changes: use debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Reset pagination and fetch fresh data
      setCurrentPage(1);
      setIsInitialLoading(true);
      fetchArticles(1, true);
    }, 300); // 300ms debounce

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, category, tag, fetchArticles]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    articles,
    isLoading,
    isInitialLoading,
    hasMore,
    total,
    error,
    sentinelRef,
  };
}
