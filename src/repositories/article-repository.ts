import { withDatabaseConnection } from "@/lib/decorators/database";
import ArticleModel from "@/models/Article";
import type { ArticleFilter, Article as ArticleType, CategoryWithCount, TagWithCount } from "@/types/article";
import type { PaginatedData } from "@/types/server-actions-response";
import { ArticleDocument } from "./../models/Article";

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
  @withDatabaseConnection()
  static async getBySlug(slug: string, incrementView = false): Promise<ArticleType | null> {
    try {
      const article = await ArticleModel.findOne({ slug, status: "published" });

      if (!article) {
        throw new Error("文章不存在");
      }

      // 如果需要增加浏览次数
      if (incrementView) {
        await ArticleModel.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });
        // 更新article对象的viewCount，避免返回旧数据
        article.viewCount += 1;
      }

      return article.toObject();
    } catch (error) {
      return null;
    }
  }

  /**
   * 增加文章浏览次数
   * @param slug 文章slug
   * @returns 是否成功
   */
  @withDatabaseConnection()
  static async incrementViewCount(slug: string): Promise<boolean> {
    try {
      const result = await ArticleModel.findOneAndUpdate({ slug, status: "published" }, { $inc: { viewCount: 1 } });
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
  @withDatabaseConnection()
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
        ArticleModel.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
        ArticleModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        items: articles.map((article: ArticleDocument): ArticleType => {
          return article.toObject();
        }),
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
  @withDatabaseConnection()
  static async getCategories(): Promise<CategoryWithCount[]> {
    try {
      const categories = await ArticleModel.aggregate([
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
  @withDatabaseConnection()
  static async getTags(): Promise<TagWithCount[]> {
    try {
      const tags = await ArticleModel.aggregate([
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

  /**
   * 根据ID获取文章（用于编辑）
   * @param id 文章ID
   * @returns 文章数据
   */
  @withDatabaseConnection()
  static async getById(id: string): Promise<ArticleType | null> {
    try {
      const article = await ArticleModel.findById(id);

      if (!article) {
        return null;
      }

      return article.toObject();
    } catch (error) {
      console.error("根据ID获取文章失败:", error);
      return null;
    }
  }

  /**
   * 创建文章
   * @param data 文章数据
   * @returns 创建的文章
   */
  @withDatabaseConnection()
  static async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    tags: string[];
    category: string;
    status: "draft" | "published" | "archived";
    slug: string;
    coverImageUrl?: string;
  }): Promise<ArticleType> {
    try {
      // 检查slug是否已存在
      const existingArticle = await ArticleModel.findOne({ slug: data.slug });
      if (existingArticle) {
        throw new Error("URL slug 已存在，请使用其他值");
      }

      // 计算阅读时间（大约每分钟250字）
      const readingTime = Math.ceil(data.content.length / 250);

      // 如果没有提供摘要，自动生成
      const excerpt = data.excerpt || data.content.substring(0, 200) + "...";

      const articleData = {
        ...data,
        excerpt,
        readingTime,
        viewCount: 0,
        likeCount: 0,
        publishedAt: data.status === "published" ? new Date() : undefined,
      };

      const article = new ArticleModel(articleData);
      const savedArticle = await article.save();

      return {
        ...savedArticle.toObject(),
        _id: savedArticle._id.toString(),
        createdAt: savedArticle.createdAt.toISOString(),
        updatedAt: savedArticle.updatedAt.toISOString(),
        publishedAt: savedArticle.publishedAt?.toISOString(),
      };
    } catch (error) {
      console.error("创建文章失败:", error);
      throw error;
    }
  }

  /**
   * 更新文章
   * @param id 文章ID
   * @param data 更新数据
   * @returns 更新后的文章
   */
  @withDatabaseConnection()
  static async update(
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
  ): Promise<ArticleType | null> {
    try {
      // 如果更新slug，检查是否与其他文章冲突
      if (data.slug) {
        const existingArticle = await ArticleModel.findOne({
          slug: data.slug,
          _id: { $ne: id },
        });

        if (existingArticle) {
          throw new Error("URL slug 已被其他文章使用");
        }
      }

      // 计算阅读时间
      const updateData: Record<string, unknown> = { ...data };
      if (data.content) {
        updateData.readingTime = Math.ceil(data.content.length / 250);
      }

      // 如果状态改为发布且之前未发布，设置发布时间
      if (data.status === "published") {
        const currentArticle = await ArticleModel.findById(id);
        if (currentArticle && currentArticle.status !== "published") {
          updateData.publishedAt = new Date();
        }
      }

      const article = await ArticleModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!article) {
        return null;
      }

      return article.toObject();
    } catch (error) {
      console.error("更新文章失败:", error);
      throw error;
    }
  }

  /**
   * 删除文章
   * @param id 文章ID
   * @returns 是否成功
   */
  @withDatabaseConnection()
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await ArticleModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("删除文章失败:", error);
      throw error;
    }
  }

  /**
   * 批量操作文章
   * @param action 操作类型
   * @param articleIds 文章ID列表
   * @param data 额外数据
   * @returns 操作结果
   */
  @withDatabaseConnection()
  static async bulkOperation(
    action: "delete" | "publish" | "archive" | "draft" | "updateCategory" | "updateTags",
    articleIds: string[],
    data?: { category?: string; tags?: string[] }
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!articleIds || articleIds.length === 0) {
        throw new Error("请选择要操作的文章");
      }

      const updateData: Record<string, unknown> = {};
      let actionMessage = "";

      switch (action) {
        case "delete":
          await ArticleModel.deleteMany({ _id: { $in: articleIds } });
          actionMessage = `成功删除 ${articleIds.length} 篇文章`;
          break;

        case "publish":
          updateData.status = "published";
          updateData.publishedAt = new Date();
          actionMessage = `成功发布 ${articleIds.length} 篇文章`;
          break;

        case "draft":
          updateData.status = "draft";
          updateData.publishedAt = undefined;
          actionMessage = `成功转为草稿 ${articleIds.length} 篇文章`;
          break;

        case "archive":
          updateData.status = "archived";
          actionMessage = `成功归档 ${articleIds.length} 篇文章`;
          break;

        case "updateCategory":
          if (!data?.category) {
            throw new Error("请指定要更新的分类");
          }
          updateData.category = data.category;
          actionMessage = `成功更新 ${articleIds.length} 篇文章的分类`;
          break;

        case "updateTags":
          if (!data?.tags) {
            throw new Error("请指定要更新的标签");
          }
          updateData.tags = data.tags;
          actionMessage = `成功更新 ${articleIds.length} 篇文章的标签`;
          break;

        default:
          throw new Error("不支持的操作类型");
      }

      if (action !== "delete") {
        await ArticleModel.updateMany({ _id: { $in: articleIds } }, { $set: updateData });
      }

      return { success: true, message: actionMessage };
    } catch (error) {
      console.error("批量操作失败:", error);
      throw error;
    }
  }

  /**
   * 获取仪表板统计数据
   * @returns 统计数据
   */
  @withDatabaseConnection()
  static async getDashboardStats(): Promise<{
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
  }> {
    try {
      // 获取文章统计数据
      const [
        totalArticles,
        publishedArticles,
        draftArticles,
        archivedArticles,
        recentArticles,
        categories,
        tags,
        totalViews,
      ] = await Promise.all([
        ArticleModel.countDocuments(),
        ArticleModel.countDocuments({ status: "published" }),
        ArticleModel.countDocuments({ status: "draft" }),
        ArticleModel.countDocuments({ status: "archived" }),
        ArticleModel.find().sort({ createdAt: -1 }).limit(10).select("_id title status createdAt viewCount"),
        ArticleModel.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ]),
        ArticleModel.aggregate([
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ]),
        ArticleModel.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
      ]);

      // 计算时间段浏览量
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const currentWeek = new Date();
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
      currentWeek.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [thisMonthArticles, thisWeekArticles, todayArticles] = await Promise.all([
        ArticleModel.find({ createdAt: { $gte: currentMonth } }).select("viewCount"),
        ArticleModel.find({ createdAt: { $gte: currentWeek } }).select("viewCount"),
        ArticleModel.find({ createdAt: { $gte: today } }).select("viewCount"),
      ]);

      const thisMonthViews = thisMonthArticles.reduce((sum, article) => sum + article.viewCount, 0);
      const thisWeekViews = thisWeekArticles.reduce((sum, article) => sum + article.viewCount, 0);
      const todayViews = todayArticles.reduce((sum, article) => sum + article.viewCount, 0);

      return {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles,
          archived: archivedArticles,
        },
        views: {
          total: totalViews[0]?.total || 0,
          thisMonth: thisMonthViews,
          thisWeek: thisWeekViews,
          today: todayViews,
        },
        categories: categories || [],
        tags: tags || [],
        recentArticles: recentArticles.map((article) => ({
          ...article.toObject(),
          _id: article._id.toString(),
          title: article.title,
          status: article.status,
          createdAt: article.createdAt.toISOString(),
          viewCount: article.viewCount,
        })),
      };
    } catch (error) {
      console.error("获取仪表板统计失败:", error);
      throw error;
    }
  }

  /**
   * 获取文章列表（支持更多筛选条件）
   * @param params 查询参数
   * @returns 分页的文章列表
   */
  @withDatabaseConnection()
  static async getListAdvanced(
    params: {
      page?: number;
      limit?: number;
      status?: "published" | "draft" | "archived" | "all";
      category?: string;
      tag?: string;
      search?: string;
      sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "viewCount";
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<PaginatedData<ArticleType>> {
    try {
      const {
        page = 1,
        limit = 10,
        status = "all",
        category,
        tag,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      // 构建查询条件
      const filter: Record<string, unknown> = {};

      if (status && status !== "all") {
        filter.status = status;
      }

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

      // 构建排序条件
      const sortDirection = sortOrder === "asc" ? 1 : -1;
      const sort: Record<string, 1 | -1> = { [sortBy]: sortDirection as 1 | -1 };

      // 计算分页
      const skip = (page - 1) * limit;

      // 并行执行查询和计数
      const [articles, total] = await Promise.all([
        ArticleModel.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select("title excerpt category status tags slug viewCount likeCount createdAt updatedAt publishedAt")
          .lean<ArticleDocument[]>(),
        ArticleModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items: articles.map(
          (article): ArticleType => ({
            ...article,
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
      throw error;
    }
  }
}
