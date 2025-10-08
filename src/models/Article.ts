import type { Article } from "@/types/article";
import { escapeHTML } from "@/utils/transform";
import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

// 数据库文档接口：基于Article类型，但将日期字段改为Date类型
// 数据在MongoDB中存储时的类型
interface IArticle extends Omit<Article, "createdAt" | "updatedAt" | "publishedAt"> {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// a hydrated Mongoose document, with methods, virtuals, and other Mongoose-specific features
export type ArticleDocument = HydratedDocument<IArticle>;

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

// 在保存前自动设置发布时间、计算阅读时长并转义content内容
ArticleSchema.pre("save", function (next) {
  // 自动设置发布时间
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // 自动转义content内容，防止XSS攻击
  if (this.isModified("content") && this.content && typeof this.content === "string") {
    (this.content as string) = escapeHTML(this.content);
    // 根据内容长度粗略计算阅读时间（约250字符/分钟）
    this.readingTime = Math.max(0, Math.ceil(this.content.length / 250));
  }

  // 如果未设置阅读时间，则按现有内容估算
  if ((this.readingTime === undefined || this.readingTime === null) && typeof this.content === "string") {
    this.readingTime = Math.max(0, Math.ceil(this.content.length / 250));
  }

  next();
});

// 检查模型是否已经存在，避免重复编译
const ArticleModel: Model<IArticle> = mongoose.models?.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default ArticleModel;
