"use client";

import { getArticleList, getCategories, getTags, initializeTestData, testDatabaseConnection } from "@/actions/article";
import ServerActionBuilder from "@/lib/server-action";
import { Article } from "@/types/article";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TestApiPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 获取文章列表
  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await getArticleList();
      if (ServerActionBuilder.isSuccess(result)) {
        setArticles(result.data?.items || []);
        setSuccess(result.message || "获取文章列表成功！共 " + (result.data?.items?.length || 0) + " 篇文章");
      } else {
        setError(result.error || "获取文章列表失败");
      }
    } catch (err) {
      setError("获取文章列表失败：" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await getCategories();
      if (ServerActionBuilder.isSuccess(result)) {
        setCategories(result.data || []);
        setSuccess(result.message || "获取分类列表成功！共 " + (result.data?.length || 0) + " 个分类");
      } else {
        setError(result.error || "获取分类列表失败");
      }
    } catch (err) {
      setError("获取分类列表失败：" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 获取标签列表
  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await getTags();
      if (ServerActionBuilder.isSuccess(result)) {
        setTags(result.data || []);
        setSuccess(result.message || "获取标签列表成功！共 " + (result.data?.length || 0) + " 个标签");
      } else {
        setError(result.error || "获取标签列表失败");
      }
    } catch (err) {
      setError("获取标签列表失败：" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 初始化测试数据
  const initializeData = async (force: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await initializeTestData(force);

      if (ServerActionBuilder.isSuccess(result)) {
        setSuccess(result.data || result.message || "初始化成功");
        // 初始化成功后自动获取文章列表
        await fetchArticles();
      } else {
        setError(result.error || "初始化失败");
      }
    } catch (err) {
      setError("网络错误：" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 测试MongoDB连接
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await testDatabaseConnection();
      if (ServerActionBuilder.isSuccess(result)) {
        setSuccess(result.data || result.message || "连接成功");
      } else {
        setError(result.error || "连接失败");
      }
    } catch (err) {
      setError("MongoDB连接失败：" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时自动测试连接
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="avoidHeader container mx-auto px-4">
      <h1 className="mb-8 text-3xl font-bold">数据库服务测试页面</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        此页面使用 Server Actions 测试数据库连接和服务层功能，符合新架构规范。
      </p>

      {/* 状态显示 */}
      {loading && (
        <div className="mb-4 rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700">
          <p>加载中...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>错误: {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <p>{success}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <button
          onClick={testConnection}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          测试连接
        </button>

        <button
          onClick={() => initializeData(false)}
          disabled={loading}
          className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-50"
        >
          初始化数据
        </button>

        <button
          onClick={() => initializeData(true)}
          disabled={loading}
          className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          强制初始化数据
        </button>

        <button
          onClick={fetchArticles}
          disabled={loading}
          className="rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          获取文章列表
        </button>

        <button
          onClick={fetchCategories}
          disabled={loading}
          className="rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          获取分类列表
        </button>

        <button
          onClick={fetchTags}
          disabled={loading}
          className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:opacity-50"
        >
          获取标签列表
        </button>
      </div>

      {/* 文章列表 */}
      {articles.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">文章列表 ({articles.length} 篇)</h2>
          <div className="grid gap-6">
            {articles.map((article) => (
              <Link href={`/article/${article.slug}`} key={article._id}>
                <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                      {article.title}
                    </h3>
                    <span
                      className={`rounded px-2 py-1 text-sm ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : article.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>

                  <p className="mb-3 text-gray-600 dark:text-gray-300">{article.excerpt}</p>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="mx-2">|</span>
                      <span>分类: {article.category}</span>
                      {article.readingTime && (
                        <>
                          <span className="mx-2">|</span>
                          <span>阅读时间: {article.readingTime} 分钟</span>
                        </>
                      )}
                    </div>
                    <div>
                      <span>浏览: {article.viewCount}</span>
                      <span className="mx-2">|</span>
                      <span>点赞: {article.likeCount}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    创建时间: {new Date(article.createdAt).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 分类列表 */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">分类列表 ({categories.length} 个)</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <div key={index} className="rounded-lg border p-4 shadow-sm">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-gray-600">{category.count} 篇文章</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">标签列表 ({tags.length} 个)</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 环境变量提示 */}
      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">环境变量配置</h3>
        <p className="text-sm text-gray-600">
          请确保在 <code className="rounded bg-gray-200 px-1">.env.local</code> 文件中设置了{" "}
          <code className="rounded bg-gray-200 px-1">MONGODB_URL</code> 环境变量。
        </p>
        <p className="mt-1 text-sm text-gray-600">
          例如: <code className="rounded bg-gray-200 px-1">MONGODB_URL=mongodb://localhost:27017/sleepy-blog</code>
        </p>
      </div>
    </div>
  );
}
