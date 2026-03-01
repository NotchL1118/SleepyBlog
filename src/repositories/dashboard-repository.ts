import { withDatabaseConnection } from "@/lib/decorators/database";
import { IDashboardStats } from "@/types/dashboard";
import ArticleModel from "@/models/Article";

/**
 * 仪表盘数据访问层
 * 提供仪表盘相关的直接操作数据库的方法
 * 单一职责，该类中的方法只从数据库中获取数据，不进行业务处理
 */
export default class DashboardRepository {
  /**
   * 获取仪表板统计数据
   * @returns 统计数据
   */
  @withDatabaseConnection()
  static async getDashboardStats(): Promise<IDashboardStats> {
    try {
      // 并行获取所有统计数据
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
        // 文章统计
        ArticleModel.countDocuments(),
        ArticleModel.countDocuments({ status: "published" }),
        ArticleModel.countDocuments({ status: "draft" }),
        ArticleModel.countDocuments({ status: "archived" }),
        // 最近文章
        ArticleModel.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select("_id slug title status createdAt viewCount"),
        // 分类统计
        ArticleModel.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ]),
        // 标签统计
        ArticleModel.aggregate([
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ]),
        // 总浏览量
        ArticleModel.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
      ]);

      return {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles,
          archived: archivedArticles,
        },
        views: {
          total: totalViews[0]?.total || 0,
        },
        categories: categories || [],
        tags: tags || [],
        recentArticles: recentArticles.map((article) => ({
          _id: article._id.toString(),
          slug: article.slug,
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
}
