import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import type {
  ArticleDocument,
  ArticleFilter,
  Article as ArticleType,
  CategoryWithCount,
  TagWithCount,
} from "@/types/article";
import type { PaginatedData } from "@/types/server-actions-response";

/**
 * 文章数据访问层
 * 提供文章相关的直接操作数据库的方法
 */
export default class ArticleRepository {
  /**
   * 根据slug获取文章
   * @param slug 文章slug
   * @param incrementView 是否增加浏览次数
   * @returns 文章数据或null
   */
  static async getBySlug(slug: string, incrementView = false): Promise<ArticleType> {
    try {
      await connectToDatabase();

      const article = await Article.findOne({ slug, status: "published" });

      if (!article) {
        throw new Error("文章不存在");
      }

      // 如果需要增加浏览次数
      if (incrementView) {
        await Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });
        // 更新article对象的viewCount，避免返回旧数据
        article.viewCount += 1;
      }

      return article.toObject();
    } catch (error) {
      console.error("获取文章失败:", error);
      throw new Error("获取文章失败");
    }
  }

  /**
   * 增加文章浏览次数
   * @param slug 文章slug
   * @returns 是否成功
   */
  static async incrementViewCount(slug: string): Promise<boolean> {
    try {
      await connectToDatabase();

      const result = await Article.findOneAndUpdate({ slug, status: "published" }, { $inc: { viewCount: 1 } });

      return !!result;
    } catch (error) {
      console.error("增加浏览次数失败:", error);
      throw new Error("增加浏览次数失败");
    }
  }

  /**
   * 获取文章列表
   * @param params 查询参数
   * @returns 分页的文章列表
   */
  static async getList(
    params: {
      page?: number;
      limit?: number;
      status?: "published" | "draft";
      category?: string;
      tag?: string;
      search?: string;
    } = {}
  ): Promise<PaginatedData<ArticleType>> {
    try {
      await connectToDatabase();

      const { page = 1, limit = 10, status = "published", category, tag, search } = params;

      // 构建查询条件
      const filter: ArticleFilter = { status };

      if (category) {
        filter.category = category;
      }

      if (tag) {
        filter.tags = { $in: [tag] };
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { excerpt: { $regex: search, $options: "i" } },
        ];
      }

      // 计算分页
      const skip = (page - 1) * limit;

      // 并行执行查询和计数
      const [articles, total] = await Promise.all([
        Article.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean<ArticleDocument[]>(),
        Article.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items: articles.map(
          (article: ArticleDocument): ArticleType => ({
            ...article,
            _id: article._id.toString(),
            createdAt: article.createdAt.toISOString(),
            updatedAt: article.updatedAt.toISOString(),
            publishedAt: article.publishedAt?.toISOString(),
          })
        ),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("获取文章列表失败:", error);
      return {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * 获取所有分类及其文章数量
   * @returns 分类列表
   */
  static async getCategories(): Promise<CategoryWithCount[]> {
    try {
      await connectToDatabase();

      const categories = await Article.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1, name: 1 } },
      ]);

      return categories;
    } catch (error) {
      console.error("获取分类失败:", error);
      return [];
    }
  }

  /**
   * 获取所有标签及其文章数量
   * @returns 标签列表
   */
  static async getTags(): Promise<TagWithCount[]> {
    try {
      await connectToDatabase();

      const tags = await Article.aggregate([
        { $match: { status: "published" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1, name: 1 } },
      ]);

      return tags;
    } catch (error) {
      console.error("获取标签失败:", error);
      return [];
    }
  }
}
