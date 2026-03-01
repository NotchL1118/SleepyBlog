"use client";

import { bulkOperateArticles, deleteArticle, getArticleListAdvanced } from "@/actions/dashboard";
import type { IArticle } from "@/types/article";
import type { PaginatedData } from "@/types/server-actions-response";
import { message } from "@/utils/message-info";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Square,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CategorySelector from "./[id]/components/CategorySelector";

interface Filter {
  status: "published" | "draft" | "archived" | "all";
  page: number;
  limit: number;
  sortBy: "createdAt" | "updatedAt" | "publishedAt" | "viewCount";
  sortOrder: "asc" | "desc";
  searchQuery?: string;
  category?: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<PaginatedData<IArticle> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>({
    status: "all",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getArticleListAdvanced({
        page: filter.page,
        limit: filter.limit,
        status: filter.status,
        category: filter.category,
        search: filter.searchQuery,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      });

      if (result.success) {
        setArticles(result.data);
      } else {
        console.error("Failed to fetch articles:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = (searchQuery: string) => {
    setFilter((prev) => ({ ...prev, searchQuery, page: 1 }));
  };

  const handleStatusFilter = (status: Filter["status"]) => {
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleSort = (sortBy: Filter["sortBy"]) => {
    setFilter((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === articles?.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles?.items.map((a) => a.slug) || []);
    }
  };

  const toggleSelectArticle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkOperation = async (
    action: "delete" | "publish" | "archive" | "draft" | "updateCategory" | "updateTags",
    data?: { category?: string; tags?: string[] }
  ) => {
    if (selectedIds.length === 0) {
      message.warning("请先选择文章");
      return;
    }

    const confirmMessage = {
      delete: "确定要删除选中的文章吗？此操作不可恢复。",
      publish: "确定要发布选中的文章吗？",
      draft: "确定要将选中的文章转为草稿吗？",
      archive: "确定要归档选中的文章吗？",
      updateCategory: "确定要更新选中文章的分类吗？",
      updateTags: "确定要更新选中文章的标签吗？",
    };

    if (!confirm(confirmMessage[action])) return;

    try {
      const result = await bulkOperateArticles(action, selectedIds, data);

      if (result.success) {
        message.success(result.data?.message || result.message || "操作成功");
        setSelectedIds([]);
        await fetchArticles();
      } else {
        message.error(result.message || "操作失败");
      }
    } catch (error) {
      console.error("Bulk operation error:", error);
      message.error("操作失败");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除文章"${title}"吗？此操作不可恢复。`)) return;

    try {
      const result = await deleteArticle(id);

      if (result.success) {
        message.success(result.message || "文章删除成功");
        await fetchArticles();
      } else {
        message.error(result.message || "删除失败");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("删除失败");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "archived":
        return "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "已发布";
      case "draft":
        return "草稿";
      case "archived":
        return "已归档";
      default:
        return "未知";
    }
  };

  if (isLoading && !articles) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-400"></div>
          <span className="text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">文章管理</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">管理所有博客文章</p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          新建文章
        </Link>
      </div>

      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <div className="relative z-10 rounded-xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/90 dark:shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg flex-1">
              <div className="group relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  type="text"
                  placeholder="搜索文章标题、内容..."
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-800 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 dark:hover:border-indigo-500 dark:focus:bg-gray-800"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="group relative">
                <select
                  aria-label="筛选状态"
                  value={filter.status}
                  onChange={(e) => handleStatusFilter(e.target.value as Filter["status"])}
                  className="appearance-none rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pr-9 text-gray-800 shadow-sm outline-none transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-indigo-500"
                >
                  <option value="all">所有状态</option>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                  <option value="archived">已归档</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" />
              </div>

              <div className="w-48">
                <CategorySelector
                  value={filter.category || ""}
                  onChange={(category) =>
                    setFilter((prev) => ({
                      ...prev,
                      category: category || undefined,
                      page: 1,
                    }))
                  }
                  placeholder="筛选分类"
                  allowClear
                />
              </div>

              <div className="group relative">
                <select
                  aria-label="排序"
                  value={`${filter.sortBy}-${filter.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilter((prev) => ({
                      ...prev,
                      sortBy: sortBy as Filter["sortBy"],
                      sortOrder: sortOrder as Filter["sortOrder"],
                    }));
                  }}
                  className="appearance-none rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pr-9 text-gray-800 shadow-sm outline-none transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-indigo-500"
                >
                  <option value="createdAt-desc">创建时间（最新）</option>
                  <option value="createdAt-asc">创建时间（最旧）</option>
                  <option value="updatedAt-desc">更新时间（最新）</option>
                  <option value="updatedAt-asc">更新时间（最旧）</option>
                  <option value="viewCount-desc">浏览量（最多）</option>
                  <option value="viewCount-asc">浏览量（最少）</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedIds.length > 0 && (
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 backdrop-blur-sm dark:border-indigo-700 dark:from-indigo-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                已选择 {selectedIds.length} 篇文章
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkOperation("publish")}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md"
                >
                  批量发布
                </button>
                <button
                  onClick={() => handleBulkOperation("draft")}
                  className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-yellow-700 hover:shadow-md"
                >
                  转为草稿
                </button>
                <button
                  onClick={() => handleBulkOperation("archive")}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md"
                >
                  批量归档
                </button>
                <button
                  onClick={() => handleBulkOperation("delete")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md"
                >
                  批量删除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 文章列表 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/90 dark:shadow-xl">
          {articles?.items.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button onClick={toggleSelectAll} className="flex items-center">
                          {selectedIds.length === articles.items.length ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        文章
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        分类
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        浏览量
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {articles.items.map((article) => (
                      <tr key={article._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <button onClick={() => toggleSelectArticle(article._id || "")} className="flex items-center">
                            {selectedIds.includes(article._id || "") ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <Link
                              href={`/dashboard/articles/${article._id}`}
                              className="line-clamp-1 text-sm font-medium text-gray-900 transition-colors hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
                            >
                              {article.title}
                            </Link>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                              {article.excerpt}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                  <Tag className="mr-1 h-3 w-3" />
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{article.tags.length - 3} 更多</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">{article.category}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(article.status)}`}
                          >
                            {getStatusText(article.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center">
                            <Eye className="mr-1 h-4 w-4 text-gray-400" />
                            {article.viewCount}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(article.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/dashboard/articles/${article._id}`}
                              className="rounded-lg p-2 text-indigo-600 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                              title="编辑"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(article._id || "", article.title)}
                              className="rounded-lg p-2 text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white/50 px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, articles.pagination.page - 1))}
                    disabled={articles.pagination.page <= 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(Math.min(articles.pagination.totalPages, articles.pagination.page + 1))
                    }
                    disabled={articles.pagination.page >= articles.pagination.totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    下一页
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      显示{" "}
                      <span className="font-medium">
                        {(articles.pagination.page - 1) * articles.pagination.limit + 1}
                      </span>{" "}
                      到{" "}
                      <span className="font-medium">
                        {Math.min(articles.pagination.page * articles.pagination.limit, articles.pagination.total)}
                      </span>{" "}
                      共 <span className="font-medium">{articles.pagination.total}</span> 篇文章
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => handlePageChange(Math.max(1, articles.pagination.page - 1))}
                        disabled={articles.pagination.page <= 1}
                        className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {Array.from({ length: Math.min(5, articles.pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium transition-colors ${
                              page === articles.pagination.page
                                ? "z-10 border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          handlePageChange(Math.min(articles.pagination.totalPages, articles.pagination.page + 1))
                        }
                        disabled={articles.pagination.page >= articles.pagination.totalPages}
                        className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">暂无文章</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">开始创建您的第一篇博客文章吧！</p>
              <div className="mt-6">
                <Link
                  href="/dashboard/articles/new"
                  className="inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新建文章
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
