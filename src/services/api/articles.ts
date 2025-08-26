import { PaginatedData } from "@/types/api";
import { Article, CategoryWithCount, TagWithCount } from "@/types/article";
import { apiFetch, ApiRequestOptions } from "@/utils/request";

/**
 * 将参数对象转换为 URL 查询字符串
 */
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  }

  return query.toString();
}

// 文章相关 API
export interface GetArticlesParams extends Record<string, string | number | undefined> {
  page?: number;
  limit?: number;
  status?: "published" | "draft";
  category?: string;
  tag?: string;
  search?: string;
}

/**
 * 获取文章列表
 */
export const getArticles = async (
  params: GetArticlesParams = {},
  options?: ApiRequestOptions
): Promise<PaginatedData<Article>> => {
  const queryString = buildQueryString(params);
  const endpoint = queryString ? `/articles?${queryString}` : "/articles";

  const response = await apiFetch<PaginatedData<Article>>(endpoint, {
    method: "GET",
    revalidate: 300, // 5分钟缓存
    ...options,
  });

  return response.data;
};

/**
 * 获取单篇文章
 */
export const getArticleBySlug = async (slug: string, options?: ApiRequestOptions): Promise<Article> => {
  const response = await apiFetch<Article>(`/articles/${slug}`, {
    method: "GET",
    revalidate: 3600, // 1小时缓存
    ...options,
  });

  return response.data;
};
// #endregion

/**
 * 获取所有分类及其文章数量
 */
export const getCategories = async (options?: ApiRequestOptions): Promise<CategoryWithCount[]> => {
  const response = await apiFetch<CategoryWithCount[]>("/articles/categories", {
    method: "GET",
    revalidate: 1800, // 30分钟缓存
    ...options,
  });

  return response.data;
};

/**
 * 获取所有标签及其文章数量
 */
export const getTags = async (options?: ApiRequestOptions): Promise<TagWithCount[]> => {
  const response = await apiFetch<TagWithCount[]>("/articles/tags", {
    method: "GET",
    revalidate: 1800, // 30分钟缓存
    ...options,
  });

  return response.data;
};
