import type { Article } from "@/types/article";
import mongoose, { Document, Schema } from "mongoose";

// 数据库文档接口：基于Article类型，但将日期字段改为Date类型
export interface IArticle extends Document, Omit<Article, "_id" | "createdAt" | "updatedAt" | "publishedAt"> {
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// 定义文章模式
const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "标题是必填项"],
      trim: true,
      maxlength: [200, "标题不能超过200个字符"],
    },
    content: {
      type: String,
      required: [true, "内容是必填项"],
    },
    excerpt: {
      type: String,
      maxlength: [1000, "摘要不能超过1000个字符"],
    },
    tags: {
      type: [String],
      default: [],
      // validate: {
      //   validator: function (tags: string[]) {
      //     return tags.length <= 10;
      //   },
      //   message: "标签数量不能超过10个",
      // },
    },
    category: {
      type: String,
      required: [true, "分类是必填项"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    readingTime: {
      type: Number,
      min: [0, "阅读时间不能为负数"],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "浏览次数不能为负数"],
    },
    likeCount: {
      type: Number,
      default: 0,
      min: [0, "点赞次数不能为负数"],
    },
    slug: {
      type: String,
      required: [true, "URL slug是必填项"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    coverImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  }
);

// 添加索引以提高查询性能
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ slug: 1 });

// 在保存前自动设置发布时间
ArticleSchema.pre("save", function (next) {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// 检查模型是否已经存在，避免重复编译
const Article = mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
