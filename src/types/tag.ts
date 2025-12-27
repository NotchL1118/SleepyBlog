/**
 * 标签接口 - 客户端使用
 *
 * 用于前端组件和 Server Actions 的返回类型。
 * 日期字段使用字符串类型，便于 JSON 序列化。
 */
export interface ITag {
  _id: string;
  name: string;
  slug: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 标签表单数据接口
 *
 * 用于创建和编辑标签时的表单数据。
 */
export interface TagFormData {
  name: string;
  slug: string;
}

/**
 * 标签创建数据接口
 *
 * 用于创建新标签时的数据。
 */
export type TagCreateData = TagFormData;

/**
 * 标签更新数据接口
 *
 * 用于更新标签时的数据（所有字段可选）。
 */
export type TagUpdateData = Partial<TagFormData>;

/**
 * 标签查询选项接口
 */
export interface TagQueryOptions {
  sortBy?: "name" | "articleCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}
