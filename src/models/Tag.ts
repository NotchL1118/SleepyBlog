import type { ITag } from "@/types/tag";
import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

/**
 * 标签实体接口 - MongoDB 数据库存储格式
 *
 * 表示标签在 MongoDB 中的实际存储结构。
 * 与前端使用的 ITag 类型的主要区别是日期字段使用 Date 类型而非字符串，
 * 并包含 MongoDB 的 ObjectId 类型的 _id 字段。
 */
export interface ITagEntity extends Omit<ITag, "_id" | "createdAt" | "updatedAt"> {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// a hydrated Mongoose document, with methods, virtuals, and other Mongoose-specific features
export type ITagDocument = HydratedDocument<ITagEntity>;

// 定义标签模式
const TagSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "标签名称是必填项"],
      unique: true,
      trim: true,
      maxlength: [30, "标签名称不能超过30个字符"],
    },
    slug: {
      type: String,
      required: [true, "URL slug是必填项"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "URL slug只能包含小写字母、数字和连字符"],
    },
    articleCount: {
      type: Number,
      default: 0,
      min: [0, "文章数量不能为负数"],
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  }
);

// 在保存前自动生成 slug（如果没有提供）
TagSchema.pre("save", function (next) {
  if (!this.slug && this.name && typeof this.name === "string") {
    // 根据名称生成 slug
    this.slug = this.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // 去除音标
      .replace(/[^a-z0-9]+/g, "-") // 仅保留小写字母、数字，用连字符分隔
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// 检查模型是否已经存在，避免重复编译
const TagModel: Model<ITagEntity> = mongoose.models?.Tag || mongoose.model<ITagEntity>("Tag", TagSchema);

export default TagModel;
