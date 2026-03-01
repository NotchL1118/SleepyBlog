import { memo } from "react";

/**
 * 下拉菜单加载状态
 */
export const LoadingState = memo(function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-400"></div>
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">加载中...</span>
    </div>
  );
});
