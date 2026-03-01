import { memo } from "react";

interface EmptyStateProps {
  hasSearchQuery: boolean;
  searchQuery: string;
}

/**
 * 下拉菜单空状态
 */
export const EmptyState = memo(function EmptyState({ hasSearchQuery, searchQuery }: EmptyStateProps) {
  if (hasSearchQuery) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">未找到匹配的分类 &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  return (
    <div className="py-8 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">暂无分类</p>
    </div>
  );
});
