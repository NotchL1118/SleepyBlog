"use server";
import connectToDatabase from "@/lib/mongodb";
import ServerActionBuilder from "@/lib/server-action";
import ArticleModel from "@/models/Article";
import ArticleRepository from "@/repositories/article-repository";
import type { Article, CategoryWithCount, TagWithCount } from "@/types/article";
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
}): Promise<ServerActionResponse<PaginatedData<Article>>> {
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
): Promise<ServerActionResponse<Article | null>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getBySlug(slug, incrementView), {
    successMessage: "获取文章成功",
    onError: (error) => console.error("Server Action - 获取文章失败:", error),
  });
}

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(): Promise<ServerActionResponse<string>> {
  return ServerActionBuilder.execute(
    async () => {
      // 尝试获取一篇文章来测试连接
      await ArticleRepository.getList({ page: 1, limit: 1 });
      return "MongoDB连接成功！";
    },
    {
      successMessage: "MongoDB连接成功！",
      errorMessage: "MongoDB连接失败",
    }
  );
}

/**
 * 初始化测试数据
 * 直接在 Server Action 中实现，不需要调用 API
 */
export async function initializeTestData(force: boolean = false): Promise<ServerActionResponse<string>> {
  return ServerActionBuilder.execute(
    async () => {
      await connectToDatabase();
      // 检查是否已有数据
      const existingCount = await ArticleModel.countDocuments();

      if (existingCount > 0 && !force) {
        throw new Error("数据库中已存在文章数据，无需重复初始化");
      }

      if (existingCount > 0 && force) {
        await ArticleModel.deleteMany({});
      }

      // 创建示例文章 - 使用逐个保存的方式以触发 pre save 钩子
      const sampleArticles = [
        {
          title: "Next.js 15 新特性详解",
          content: `# Next.js 15 新特性详解\n\nNext.js 15 带来了许多令人兴奋的新特性和改进。\n\n## 主要特性\n\n### 1. 改进的性能\n- 更快的构建时间\n- 优化的运行时性能\n- 更好的内存使用`,
          excerpt: "Next.js 15 带来了许多令人兴奋的新特性和改进。",
          tags: ["Next.js", "React", "前端开发"],
          category: "前端技术",
          status: "published" as const,
          slug: "nextjs-15-features",
          viewCount: 156,
          likeCount: 23,
        },
        {
          title: "TypeScript 高级类型技巧",
          content: `# TypeScript 高级类型技巧\n\nTypeScript 提供了强大的类型系统，掌握高级类型技巧可以让我们写出更安全、更优雅的代码。\n\n## 工具类型\n\n### Partial<T>\n将所有属性变为可选。`,
          excerpt: "TypeScript 提供了强大的类型系统，掌握高级类型技巧可以让我们写出更安全、更优雅的代码。",
          tags: ["TypeScript", "类型系统", "前端开发"],
          category: "编程语言",
          status: "published" as const,
          slug: "typescript-advanced-types",
          viewCount: 234,
          likeCount: 42,
        },
      ];

      // 逐个保存文章以触发 pre save 钩子进行内容转义
      const createdArticles = [];
      for (const articleData of sampleArticles) {
        const article = new ArticleModel(articleData);
        const savedArticle = await article.save();
        createdArticles.push(savedArticle);
      }
      return `成功创建 ${createdArticles.length} 篇示例文章`;
    },
    {
      successMessage: "数据初始化成功",
      errorMessage: "数据初始化失败",
    }
  );
}

// ============ Dashboard 相关 Server Actions ============

/**
 * 获取仪表板统计数据
 */
export async function getDashboardStats(): Promise<
  ServerActionResponse<{
    articles: {
      total: number;
      published: number;
      draft: number;
      archived: number;
    };
    views: {
      total: number;
      thisMonth: number;
      thisWeek: number;
      today: number;
    };
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    recentArticles: Array<{
      _id: string;
      title: string;
      status: string;
      createdAt: string;
      viewCount: number;
    }>;
  }>
> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getDashboardStats(), {
    successMessage: "获取统计数据成功",
    errorMessage: "获取统计数据失败",
    onError: (error) => console.error("Server Action - 获取统计数据失败:", error),
  });
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
}): Promise<ServerActionResponse<PaginatedData<Article>>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getListAdvanced(params), {
    successMessage: "获取文章列表成功",
    errorMessage: "获取文章列表失败",
    onError: (error) => console.error("Server Action - 获取文章列表失败:", error),
  });
}

/**
 * 根据ID获取文章
 */
export async function getArticleById(id: string): Promise<ServerActionResponse<Article | null>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.getById(id), {
    successMessage: "获取文章成功",
    errorMessage: "获取文章失败",
    onError: (error) => console.error("Server Action - 获取文章失败:", error),
  });
}

/**
 * 创建文章
 */
export async function createArticle(data: {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  category: string;
  status: "draft" | "published" | "archived";
  slug: string;
  coverImageUrl?: string;
}): Promise<ServerActionResponse<Article>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.create(data), {
    successMessage: "文章创建成功",
    errorMessage: "文章创建失败",
    onError: (error) => console.error("Server Action - 创建文章失败:", error),
  });
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
): Promise<ServerActionResponse<Article | null>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.update(id, data), {
    successMessage: "文章更新成功",
    errorMessage: "文章更新失败",
    onError: (error) => console.error("Server Action - 更新文章失败:", error),
  });
}

/**
 * 删除文章
 */
export async function deleteArticle(id: string): Promise<ServerActionResponse<boolean>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.delete(id), {
    successMessage: "文章删除成功",
    errorMessage: "文章删除失败",
    onError: (error) => console.error("Server Action - 删除文章失败:", error),
  });
}

/**
 * 批量操作文章
 */
export async function bulkOperateArticles(
  action: "delete" | "publish" | "archive" | "draft" | "updateCategory" | "updateTags",
  articleIds: string[],
  data?: { category?: string; tags?: string[] }
): Promise<ServerActionResponse<{ success: boolean; message: string }>> {
  return ServerActionBuilder.execute(async () => await ArticleRepository.bulkOperation(action, articleIds, data), {
    successMessage: "批量操作成功",
    errorMessage: "批量操作失败",
    onError: (error) => console.error("Server Action - 批量操作失败:", error),
  });
}

/**
 * 验证管理员登录
 */
export async function validateAdminLogin(
  username: string,
  password: string
): Promise<ServerActionResponse<{ isValid: boolean }>> {
  return ServerActionBuilder.execute(
    async () => {
      // 从环境变量获取管理员凭据
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        throw new Error("服务器配置错误：未设置管理员凭据");
      }

      // 验证凭据
      const isValid = username === adminUsername && password === adminPassword;

      if (!isValid) {
        throw new Error("用户名或密码错误");
      }

      return { isValid };
    },
    {
      successMessage: "登录成功",
      errorMessage: "登录失败",
      onError: (error) => console.error("Server Action - 登录失败:", error),
    }
  );
}
