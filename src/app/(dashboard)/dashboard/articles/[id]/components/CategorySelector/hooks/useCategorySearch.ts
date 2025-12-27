import type { ICategory } from "@/types/category";
import { useCallback, useMemo, useState } from "react";

/**
 * 管理分类搜索逻辑
 * 使用 useMemo 避免不必要的过滤计算
 */
export function useCategorySearch(categories: ICategory[]) {
  const [searchQuery, setSearchQuery] = useState("");

  // 使用 useMemo 优化搜索过滤
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    hasSearchQuery: Boolean(searchQuery.trim()),
    clearSearch,
  };
}
