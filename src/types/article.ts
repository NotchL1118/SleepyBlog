// 在前端使用的类型
export interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  status: "draft" | "published" | "archived";
  slug: string;
  viewCount: number;
  likeCount: number;
  readingTime: number;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
export interface ArticleDocument {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  status: "draft" | "published" | "archived";
  slug: string;
  viewCount: number;
  likeCount: number;
  readingTime: number;
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

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
