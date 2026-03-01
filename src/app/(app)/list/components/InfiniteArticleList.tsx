"use client";

import ArticleCard from "@/app/(app)/_components/ArticleList/ArticleCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { IArticle } from "@/types/article";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import ArticleListSkeleton from "./ArticleListSkeleton";
import LoadingSpinner from "./LoadingSpinner";

const InfiniteArticleList = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const { articles, isLoading, isInitialLoading, hasMore, total, error, sentinelRef } = useInfiniteScroll({
    limit: 10,
    search,
    category,
    tag,
  });

  // Show skeleton during initial loading
  if (isInitialLoading) {
    return <ArticleListSkeleton count={5} />;
  }

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!isLoading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">暂无符合条件的文章</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-6">
        {articles.map((article: IArticle, index: number) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
          >
            <ArticleCard
              slug={article.slug}
              title={article.title}
              content={article.excerpt || article.content}
              coverImage={article.coverImageUrl}
              mode={index % 2 === 0 ? "normal" : "reverse"}
              date={article.publishedAt || article.createdAt}
              viewCount={article.viewCount}
              readingTime={article?.readingTime}
            />
          </motion.div>
        ))}
      </div>

      {/* Sentinel element for IntersectionObserver */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading spinner or end message */}
      <LoadingSpinner isLoading={isLoading} hasMore={hasMore} />

      {/* Total count display */}
      {total > 0 && (
        <motion.div
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          共 {total} 篇文章
        </motion.div>
      )}
    </>
  );
};

export default InfiniteArticleList;
