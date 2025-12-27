import { IArticleEntity } from "@/models/Article";

export interface IDashboardStats {
  articles: {
    total: number; // 文章总数
    published: number; // 已发布文章数
    draft: number; // 草稿文章数
    archived: number; // 已归档文章数
  };
  views: {
    total: number; // 总浏览量
  };
  categories: Array<{ name: string; count: number }>; // 总分类数
  tags: Array<{ name: string; count: number }>; // 总标签数
  recentArticles: Array<{
    _id: string;
    slug: string;
    title: string;
    status: IArticleEntity["status"];
    createdAt: string;
    viewCount: number;
  }>;
}
