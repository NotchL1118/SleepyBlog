// 在前端使用的类型
export interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  category: string;
  status: "published" | "draft";
  slug: string;
  viewCount: number;
  likeCount: number;
  readingTime: number;
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
