"use server";
import connectToDatabase from "@/lib/mongodb";
import ServerActionBuilder from "@/lib/server-action";
import Article from "@/models/Article";
import ArticleRepository from "@/repositories/article-repository";
import type { CategoryWithCount, TagWithCount } from "@/types/article";
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
export async function getArticle(slug: string, incrementView = false): Promise<ServerActionResponse<Article>> {
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
      const existingCount = await Article.countDocuments();

      if (existingCount > 0 && !force) {
        throw new Error("数据库中已存在文章数据，无需重复初始化");
      }

      if (existingCount > 0 && force) {
        await Article.deleteMany({});
      }

      // 创建示例文章
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

      const createdArticles = await Article.insertMany(sampleArticles);
      return `成功创建 ${createdArticles.length} 篇示例文章`;
    },
    {
      successMessage: "数据初始化成功",
      errorMessage: "数据初始化失败",
    }
  );
}
