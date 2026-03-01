import { memo } from "react";

interface FooterProps {
  totalCount: number;
  filteredCount: number;
  hasSearchQuery: boolean;
}

/**
 * 下拉菜单底部统计信息
 */
export const Footer = memo(function Footer({ totalCount, filteredCount, hasSearchQuery }: FooterProps) {
  return (
    <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
      共 {totalCount} 个分类
      {hasSearchQuery && ` · 显示 ${filteredCount} 个结果`}
    </div>
  );
});
