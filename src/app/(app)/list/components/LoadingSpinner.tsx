"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  isLoading: boolean;
  hasMore: boolean;
}

const LoadingSpinner = ({ isLoading, hasMore }: LoadingSpinnerProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="h-3 w-3 rounded-full bg-blue-500"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <motion.div
        className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        没有更多文章了
      </motion.div>
    );
  }

  return null;
};

export default LoadingSpinner;
