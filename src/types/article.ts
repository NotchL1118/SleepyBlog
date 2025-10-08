/*
 * @description 文章类型, 在前端页面内使用的类型
 * @description 数据库中使用的模型在 @/models/Article.ts 中定义
 * @description ArticleClient
 */
export interface Article {
  title: string; // 标题
  content: string; // 具体内容，需要经过转义，防止显示错误
  excerpt: string; // 摘要,到时候由AI生成
  tags: string[]; // 标签
  category: string; // 分类
  status: "draft" | "published" | "archived"; // 状态
  slug: string; // 唯一标识，要确保在数据库中唯一
  readingTime: number; // 阅读时间
  viewCount: number; // 浏览次数
  coverImageUrl?: string; // 封面图片
  createdAt: string | Date; // 创建时间
  updatedAt: string | Date; // 更新时间
  publishedAt?: string | Date; // 发布时间，创建了，不一定立刻发布，所以发布时间和创建时间不一样
}

export interface CategoryWithCount {
  name: string;
  count: number;
}

export interface TagWithCount {
  name: string;
  count: number;
}

// MongoDB 文档类型（包含原始的 Date 和 ObjectId）

// 查询过滤器类型
export interface ArticleFilter {
  status?: "draft" | "published" | "archived";
  category?: string;
  tags?: { $in: string[] };
  $or?: Array<{
    title?: { $regex: string; $options: string };
    content?: { $regex: string; $options: string };
    excerpt?: { $regex: string; $options: string };
  }>;
}
