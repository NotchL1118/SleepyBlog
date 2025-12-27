"use server";
import ServerActionBuilder from "@/lib/server-action";
import ArticleRepository from "@/repositories/article-repository";
import type { CategoryWithCount, IArticle, TagWithCount } from "@/types/article";
import type { PaginatedData, ServerActionResponse } from "@/types/server-actions-response";

/**
 * 增加文章浏览次数的Server Action
 * @param slug 文章slug
 * @returns 操作结果
 */
export async function incrementArticleViewCount(slug: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.execute(
    async () => {
      const success = await ArticleRepository.incrementViewCount(slug);
      if (!success) {
        throw new Error("文章不存在或增加浏览次数失败");
      }
      return success;
    },
    {
      successMessage: "浏览次数已更新",
      errorMessage: "更新浏览次数失败",
      onError: (error) => console.error("Server Action - 增加浏览次数失败:", error),
    }
  );
}

/**
 * 获取文章列表
 */
export async function getArticleList(params?: {
  page?: number;
  limit?: number;
  status?: "published" | "draft";
  category?: string;
  tag?: string;
  search?: string;
}): Promise<ServerActionResponse<PaginatedData<IArticle>>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getList(params), {
    successMessage: "获取文章列表成功",
    onError: (error) => console.error("Server Action - 获取文章列表失败:", error),
  });
}

/**
 * 获取分类列表
 */
export async function getCategories(): Promise<ServerActionResponse<CategoryWithCount[]>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getCategories(), {
    successMessage: "获取分类列表成功",
    onError: (error) => console.error("Server Action - 获取分类列表失败:", error),
  });
}

/**
 * 获取标签列表
 */
export async function getTags(): Promise<ServerActionResponse<TagWithCount[]>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getTags(), {
    successMessage: "获取标签列表成功",
    onError: (error) => console.error("Server Action - 获取标签列表失败:", error),
  });
}

/**
 * 获取单篇文章
 */
export async function getArticleBySlug(
  slug: string,
  incrementView = false
): Promise<ServerActionResponse<IArticle | null>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getBySlug(slug, incrementView), {
    successMessage: "获取文章成功",
    onError: (error) => console.error("Server Action - 获取文章失败:", error),
  });
}
