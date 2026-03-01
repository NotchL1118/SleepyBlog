import { Types } from "mongoose";

/**
 * 分类接口 - 客户端使用
 *
 * 用于前端组件和 Server Actions 的返回类型。
 * 日期字段使用字符串类型，便于 JSON 序列化。
 */
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 分类表单数据接口
 *
 * 用于创建和编辑分类时的表单数据。
 */
export interface CategoryFormData {
  name: string;
  slug: string;
  displayOrder?: number;
}

/**
 * 分类创建数据接口
 *
 * 用于创建新分类时的数据。
 */
export interface CategoryCreateData extends CategoryFormData {
  name: string;
  slug: string;
}

/**
 * 分类更新数据接口
 *
 * 用于更新分类时的数据（所有字段可选）。
 */
export type CategoryUpdateData = Partial<CategoryFormData>;

/**
 * 分类查询选项接口
 */
export interface CategoryQueryOptions {
  sortBy?: "displayOrder" | "name" | "articleCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}
