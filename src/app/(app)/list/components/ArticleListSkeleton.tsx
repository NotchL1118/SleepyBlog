"use client";

import { motion } from "framer-motion";

interface ArticleListSkeletonProps {
  count?: number;
}

const ArticleCardSkeleton = ({ mode }: { mode: "normal" | "reverse" }) => {
  return (
    <div className="relative flex h-[190px] overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800 md:h-60 lg:h-52 xl:h-60">
      {mode === "normal" && (
        <div
          className="h-full w-[45%] animate-pulse bg-gray-300 dark:bg-gray-700"
          style={{
            clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)",
          }}
        />
      )}
      <div className="z-10 flex h-full flex-1 flex-col p-10">
        {/* Title skeleton */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />

        {/* Content skeleton */}
        <div className="flex flex-1 flex-col justify-center space-y-2 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Meta info skeleton */}
        <div className="mt-2 flex items-center space-x-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-12 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
      {mode === "reverse" && (
        <div
          className="h-full w-[45%] animate-pulse bg-gray-300 dark:bg-gray-700"
          style={{
            clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />
      )}
    </div>
  );
};

const ArticleListSkeleton = ({ count = 5 }: ArticleListSkeletonProps) => {
  return (
    <div className="flex flex-col space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
        >
          <ArticleCardSkeleton mode={index % 2 === 0 ? "normal" : "reverse"} />
        </motion.div>
      ))}
    </div>
  );
};

export default ArticleListSkeleton;
