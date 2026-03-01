"use server";

import ServerActionBuilder from "@/lib/server-action";
import TagRepository from "@/repositories/tag-repository";
import type { ITag, TagCreateData, TagQueryOptions, TagUpdateData } from "@/types/tag";
import type { ServerActionResponse } from "@/types/server-actions-response";

/**
 * 获取所有标签（用于管理页面）
 * @param options 查询选项
 * @returns 标签列表
 */
export async function getAllTags(options?: TagQueryOptions): Promise<ServerActionResponse<ITag[]>> {
  return ServerActionBuilder.executeWithAdmin(
    () => TagRepository.getAll(options || {}),
    {
      successMessage: "获取标签列表成功",
      onError: (error) => console.error("Server Action - 获取标签列表失败:", error),
    }
  );
}

/**
 * 获取激活状态的标签（用于文章编辑器）
 * @returns 激活的标签列表
 */
export async function getTagsForEditor(): Promise<ServerActionResponse<ITag[]>> {
  return ServerActionBuilder.executeWithAdmin(
    () => TagRepository.getActive(),
    {
      successMessage: "获取标签列表成功",
      onError: (error) => console.error("Server Action - 获取标签列表失败:", error),
    }
  );
}

/**
 * 根据 ID 获取标签
 * @param id 标签 ID
 * @returns 标签对象
 */
export async function getTagById(id: string): Promise<ServerActionResponse<ITag | null>> {
  return ServerActionBuilder.executeWithAdmin(
    () => TagRepository.getById(id),
    {
      successMessage: "获取标签成功",
      onError: (error) => console.error("Server Action - 获取标签失败:", error),
    }
  );
}

/**
 * 根据 slug 获取标签
 * @param slug 标签 slug
 * @returns 标签对象
 */
export async function getTagBySlug(slug: string): Promise<ServerActionResponse<ITag | null>> {
  return ServerActionBuilder.execute(async () => await TagRepository.getBySlug(slug), {
    successMessage: "获取标签成功",
    onError: (error) => console.error("Server Action - 获取标签失败:", error),
  });
}

/**
 * 创建新标签
 * @param data 标签数据
 * @returns 创建的标签
 */
export async function createTag(data: TagCreateData): Promise<ServerActionResponse<ITag>> {
  return ServerActionBuilder.executeWithAdmin(
    async () => {
      // 检查标签名称是否已存在
      const nameExists = await TagRepository.existsByName(data.name);
      if (nameExists) {
        throw new Error("标签名称已存在");
      }

      // 检查 slug 是否已存在
      const slugExists = await TagRepository.existsBySlug(data.slug);
      if (slugExists) {
        throw new Error("URL slug 已存在");
      }

      return await TagRepository.create(data);
    },
    {
      successMessage: "创建标签成功",
      onError: (error) => console.error("Server Action - 创建标签失败:", error),
    }
  );
}

/**
 * 快速创建标签（仅需名称，自动生成 slug）
 * @param name 标签名称
 * @returns 创建的标签
 */
export async function quickCreateTag(name: string): Promise<ServerActionResponse<ITag>> {
  return ServerActionBuilder.executeWithAdmin(
    async () => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("标签名称不能为空");
      }

      // 检查标签名称是否已存在
      const existingTag = await TagRepository.getByName(trimmedName);
      if (existingTag) {
        // 如果已存在，直接返回已有标签
        return existingTag;
      }

      // 根据名称生成 slug
      const slug = trimmedName
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      return await TagRepository.create({ name: trimmedName, slug });
    },
    {
      successMessage: "创建标签成功",
      onError: (error) => console.error("Server Action - 快速创建标签失败:", error),
    }
  );
}

/**
 * 更新标签
 * @param id 标签 ID
 * @param data 更新数据
 * @returns 更新后的标签
 */
export async function updateTag(id: string, data: TagUpdateData): Promise<ServerActionResponse<ITag | null>> {
  return ServerActionBuilder.executeWithAdmin(
    async () => {
      // 如果更新了名称，检查是否与其他标签重复
      if (data.name) {
        const nameExists = await TagRepository.existsByName(data.name, id);
        if (nameExists) {
          throw new Error("标签名称已存在");
        }
      }

      // 如果更新了 slug，检查是否与其他标签重复
      if (data.slug) {
        const slugExists = await TagRepository.existsBySlug(data.slug, id);
        if (slugExists) {
          throw new Error("URL slug 已存在");
        }
      }

      return await TagRepository.update(id, data);
    },
    {
      successMessage: "更新标签成功",
      onError: (error) => console.error("Server Action - 更新标签失败:", error),
    }
  );
}

/**
 * 删除标签
 * @param id 标签 ID
 * @returns 是否删除成功
 */
export async function deleteTag(id: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.executeWithAdmin(
    () => TagRepository.delete(id),
    {
      successMessage: "删除标签成功",
      onError: (error) => console.error("Server Action - 删除标签失败:", error),
    }
  );
}

/**
 * 批量删除标签
 * @param ids 标签 ID 列表
 * @returns 删除的数量
 */
export async function bulkDeleteTags(ids: string[]): Promise<ServerActionResponse<number>> {
  return ServerActionBuilder.executeWithAdmin(
    () => TagRepository.bulkDelete(ids),
    {
      successMessage: `成功删除 ${ids.length} 个标签`,
      onError: (error) => console.error("Server Action - 批量删除标签失败:", error),
    }
  );
}

/**
 * 同步文章数量
 * @returns 是否同步成功
 */
export async function syncTagArticleCount(): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.executeWithAdmin(
    () => TagRepository.syncArticleCount(),
    {
      successMessage: "同步文章数量成功",
      onError: (error) => console.error("Server Action - 同步文章数量失败:", error),
    }
  );
}
