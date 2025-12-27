import { getCategoriesForEditor } from "@/actions/category";
import type { ICategory } from "@/types/category";
import { message } from "@/utils/message-info";
import { useCallback, useEffect, useState } from "react";

/**
 * 管理分类数据的获取和刷新
 */
export function useCategoryData() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getCategoriesForEditor();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        message.error(result.message || "获取分类列表失败");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("获取分类列表失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, refresh: fetchCategories };
}
