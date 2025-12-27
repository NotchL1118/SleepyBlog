import type { IArticle } from "@/types/article";
import { calculateReadingTime } from "@/utils/reading-time";
import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

/**
 * 文章实体接口 - MongoDB 数据库存储格式
 *
 * 表示文章在 MongoDB 中的实际存储结构。
 * 与前端使用的 IArticle 类型的主要区别是日期字段使用 Date 类型而非字符串，
 * 并包含 MongoDB 的 ObjectId 类型的 _id 字段。
 */
export interface IArticleEntity extends Omit<IArticle, "_id" | "createdAt" | "updatedAt" | "publishedAt"> {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// a hydrated Mongoose document, with methods, virtuals, and other Mongoose-specific features
export type IArticleDocument = HydratedDocument<IArticleEntity>;

// 定义文章模式
const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "标题是必填项"],
      trim: true,
      maxlength: [100, "标题不能超过100个字符"],
    },
    content: {
      type: String,
      required: [true, "内容是必填项"],
    },
    excerpt: {
      type: String,
      trim: true,
      default: "", // Article 类型为必填，这里默认空串，创建时可不传
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) => Array.from(new Set((tags || []).map((t) => String(t).trim()).filter(Boolean))),
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
      default: 0,
      min: [0, "阅读时间不能为负数"],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "浏览次数不能为负数"],
    },
    slug: {
      type: String,
      required: [true, "URL slug是必填项"],
      unique: true, // 唯一标识，要确保在数据库中唯一
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "URL slug只能包含小写字母、数字和连字符"],
    },
    coverImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  }
);

// 在保存前自动设置发布时间、计算阅读时长
ArticleSchema.pre("save", function (next) {
  // 自动设置发布时间
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // 使用高级算法计算阅读时间（区分中英文、内容类型加权）
  if (this.isModified("content") && this.content && typeof this.content === "string") {
    this.readingTime = calculateReadingTime(this.content);
  }

  // 如果未设置阅读时间，则按现有内容估算
  if ((this.readingTime === undefined || this.readingTime === null) && typeof this.content === "string") {
    this.readingTime = calculateReadingTime(this.content);
  }

  next();
});

// 检查模型是否已经存在，避免重复编译
const ArticleModel: Model<IArticleEntity> =
  mongoose.models?.Article || mongoose.model<IArticleEntity>("Article", ArticleSchema);

export default ArticleModel;
