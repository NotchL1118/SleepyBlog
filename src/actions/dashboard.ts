"use server";
import { serializeMDX } from "@/components/MDXContentRenderer/mdx-serializer";
import ServerActionBuilder from "@/lib/server-action";
import ArticleRepository from "@/repositories/article-repository";
import DashboardRepository from "@/repositories/dashboard-repository";
import type { IArticle } from "@/types/article";
import type { IDashboardStats } from "@/types/dashboard";
import type { PaginatedData, ServerActionResponse } from "@/types/server-actions-response";
import type { SerializeResult } from "next-mdx-remote-client/serialize";

/**
 * 获取仪表盘统计数据
 * @returns 仪表盘统计数据
 */
export async function getDashboardStats(): Promise<ServerActionResponse<IDashboardStats>> {
  return ServerActionBuilder.executeWithAdmin(
    () => DashboardRepository.getDashboardStats(),
    {
      successMessage: "获取仪表盘统计数据成功",
      onError: (error) => console.error("Server Action - 获取仪表盘统计数据失败:", error),
    }
  );
}

/**
 * 获取文章列表（支持更多筛选条件）
 */
export async function getArticleListAdvanced(params?: {
  page?: number;
  limit?: number;
  status?: "published" | "draft" | "archived" | "all";
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "viewCount";
  sortOrder?: "asc" | "desc";
}): Promise<ServerActionResponse<PaginatedData<IArticle>>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.getListAdvanced(params),
    {
      successMessage: "获取文章列表成功",
      onError: (error) => console.error("Server Action - 获取文章列表失败:", error),
    }
  );
}

/**
 * 根据ID获取文章
 */
export async function getArticleById(id: string): Promise<ServerActionResponse<IArticle | null>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.getById(id),
    {
      successMessage: "获取文章成功",
      onError: (error) => console.error("Server Action - 获取文章失败:", error),
    }
  );
}

/**
 * 创建文章
 */
export async function createArticle(data: IArticle): Promise<ServerActionResponse<IArticle>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.create(data),
    {
      successMessage: "文章创建成功",
      onError: (error) => console.error("Server Action - 创建文章失败:", error),
    }
  );
}

/**
 * 更新文章
 */
export async function updateArticle(
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    category?: string;
    status?: "draft" | "published" | "archived";
    slug?: string;
    coverImageUrl?: string;
  }
): Promise<ServerActionResponse<IArticle | null>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.update(id, data),
    {
      successMessage: "文章更新成功",
      onError: (error) => console.error("Server Action - 更新文章失败:", error),
    }
  );
}

/**
 * 删除文章
 */
export async function deleteArticle(id: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.delete(id),
    {
      successMessage: "文章删除成功",
      onError: (error) => console.error("Server Action - 删除文章失败:", error),
    }
  );
}

/**
 * 批量操作文章
 */
export async function bulkOperateArticles(
  action: "delete" | "publish" | "archive" | "draft" | "updateCategory" | "updateTags",
  articleIds: string[],
  data?: { category?: string; tags?: string[] }
): Promise<ServerActionResponse<{ success: boolean; message: string }>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.bulkOperation(action, articleIds, data),
    {
      successMessage: "批量操作成功",
      onError: (error) => console.error("Server Action - 批量操作失败:", error),
    }
  );
}

/**
 * 序列化 Markdown 内容为 MDX（用于预览）
 * @param markdown 原始 markdown 字符串
 * @returns 序列化结果（包含 compiledSource 或 error）
 */
export async function serializeMarkdownForPreview(
  markdown: string
): Promise<ServerActionResponse<SerializeResult<Record<string, unknown>, Record<string, unknown>>>> {
  return ServerActionBuilder.executeWithAdmin(
    () => serializeMDX(markdown),
    {
      successMessage: "Markdown 序列化成功",
      onError: (error) => console.error("Server Action - Markdown 序列化失败:", error),
    }
  );
}

/**
 * 检查 slug 是否已存在
 * @param slug 要检查的 slug
 * @param excludeId 排除的文章 ID（用于编辑时排除自身）
 * @returns true 表示已存在，false 表示不存在
 */
export async function checkSlugExists(slug: string, excludeId?: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.executeWithAdmin(
    () => ArticleRepository.checkSlugExists(slug, excludeId),
    {
      successMessage: "检查 slug 完成",
      onError: (error) => console.error("Server Action - 检查slug失败:", error),
    }
  );
}
