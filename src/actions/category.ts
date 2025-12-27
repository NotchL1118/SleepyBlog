"use server";

import ServerActionBuilder from "@/lib/server-action";
import CategoryRepository from "@/repositories/category-repository";
import type {
  CategoryCreateData,
  CategoryQueryOptions,
  CategoryUpdateData,
  ICategory,
} from "@/types/category";
import type { ServerActionResponse } from "@/types/server-actions-response";

/**
 * 获取所有分类（用于管理页面）
 * @param options 查询选项
 * @returns 分类列表
 */
export async function getAllCategories(
  options?: CategoryQueryOptions
): Promise<ServerActionResponse<ICategory[]>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.getAll(options || {}), {
    successMessage: "获取分类列表成功",
    onError: (error) => console.error("Server Action - 获取分类列表失败:", error),
  });
}

/**
 * 获取激活状态的分类（用于文章编辑器）
 * @returns 激活的分类列表
 */
export async function getCategoriesForEditor(): Promise<ServerActionResponse<ICategory[]>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.getActive(), {
    successMessage: "获取分类列表成功",
    onError: (error) => console.error("Server Action - 获取分类列表失败:", error),
  });
}

/**
 * 根据 ID 获取分类
 * @param id 分类 ID
 * @returns 分类对象
 */
export async function getCategoryById(id: string): Promise<ServerActionResponse<ICategory | null>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.getById(id), {
    successMessage: "获取分类成功",
    onError: (error) => console.error("Server Action - 获取分类失败:", error),
  });
}

/**
 * 根据 slug 获取分类
 * @param slug 分类 slug
 * @returns 分类对象
 */
export async function getCategoryBySlug(slug: string): Promise<ServerActionResponse<ICategory | null>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.getBySlug(slug), {
    successMessage: "获取分类成功",
    onError: (error) => console.error("Server Action - 获取分类失败:", error),
  });
}

/**
 * 创建新分类
 * @param data 分类数据
 * @returns 创建的分类
 */
export async function createCategory(data: CategoryCreateData): Promise<ServerActionResponse<ICategory>> {
  return ServerActionBuilder.execute(
    async () => {
      // 检查分类名称是否已存在
      const nameExists = await CategoryRepository.existsByName(data.name);
      if (nameExists) {
        throw new Error("分类名称已存在");
      }

      // 检查 slug 是否已存在
      const slugExists = await CategoryRepository.existsBySlug(data.slug);
      if (slugExists) {
        throw new Error("URL slug 已存在");
      }

      return await CategoryRepository.create(data);
    },
    {
      successMessage: "创建分类成功",
      onError: (error) => console.error("Server Action - 创建分类失败:", error),
    }
  );
}

/**
 * 更新分类
 * @param id 分类 ID
 * @param data 更新数据
 * @returns 更新后的分类
 */
export async function updateCategory(
  id: string,
  data: CategoryUpdateData
): Promise<ServerActionResponse<ICategory | null>> {
  return ServerActionBuilder.execute(
    async () => {
      // 如果更新了名称，检查是否与其他分类重复
      if (data.name) {
        const nameExists = await CategoryRepository.existsByName(data.name, id);
        if (nameExists) {
          throw new Error("分类名称已存在");
        }
      }

      // 如果更新了 slug，检查是否与其他分类重复
      if (data.slug) {
        const slugExists = await CategoryRepository.existsBySlug(data.slug, id);
        if (slugExists) {
          throw new Error("URL slug 已存在");
        }
      }

      return await CategoryRepository.update(id, data);
    },
    {
      successMessage: "更新分类成功",
      onError: (error) => console.error("Server Action - 更新分类失败:", error),
    }
  );
}

/**
 * 删除分类
 * @param id 分类 ID
 * @returns 是否删除成功
 */
export async function deleteCategory(id: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.delete(id), {
    successMessage: "删除分类成功",
    onError: (error) => console.error("Server Action - 删除分类失败:", error),
  });
}

/**
 * 批量删除分类
 * @param ids 分类 ID 列表
 * @returns 删除的数量
 */
export async function bulkDeleteCategories(ids: string[]): Promise<ServerActionResponse<number>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.bulkDelete(ids), {
    successMessage: `成功删除 ${ids.length} 个分类`,
    onError: (error) => console.error("Server Action - 批量删除分类失败:", error),
  });
}

/**
 * 更新分类的显示顺序
 * @param reorderData ID 和新顺序的映射数组
 * @returns 是否更新成功
 */
export async function reorderCategories(
  reorderData: Array<{ id: string; displayOrder: number }>
): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.reorder(reorderData), {
    successMessage: "更新分类顺序成功",
    onError: (error) => console.error("Server Action - 更新分类顺序失败:", error),
  });
}

/**
 * 同步文章数量
 * @returns 是否同步成功
 */
export async function syncArticleCount(): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.execute(async () => await CategoryRepository.syncArticleCount(), {
    successMessage: "同步文章数量成功",
    onError: (error) => console.error("Server Action - 同步文章数量失败:", error),
  });
}
