import { createCategory as createCategoryAction, deleteCategory as deleteCategoryAction, updateCategory as updateCategoryAction } from "@/actions/category";
import type { ICategory } from "@/types/category";
import { message } from "@/utils/message-info";
import { useCallback } from "react";

/**
 * 管理分类的 CRUD 操作
 */
export function useCategoryActions(onRefresh: () => Promise<void>, onSuccess?: (category: ICategory) => void) {
  const createCategory = useCallback(
    async (name: string, slug: string) => {
      const result = await createCategoryAction({ name, slug });

      if (result.success && result.data) {
        message.success("创建分类成功");
        await onRefresh();
        onSuccess?.(result.data);
      } else {
        message.error(result.message || "创建分类失败");
        throw new Error(result.message || "创建分类失败");
      }
    },
    [onRefresh, onSuccess]
  );

  const updateCategory = useCallback(
    async (id: string, name: string, slug: string) => {
      const result = await updateCategoryAction(id, { name, slug });

      if (result.success) {
        message.success("更新分类成功");
        await onRefresh();
      } else {
        message.error(result.message || "更新分类失败");
        throw new Error(result.message || "更新分类失败");
      }
    },
    [onRefresh]
  );

  const deleteCategory = useCallback(
    async (category: ICategory) => {
      const result = await deleteCategoryAction(category._id);

      if (result.success) {
        message.success("删除分类成功");
        await onRefresh();
      } else {
        message.error(result.message || "删除分类失败");
        throw new Error(result.message || "删除分类失败");
      }
    },
    [onRefresh]
  );

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
