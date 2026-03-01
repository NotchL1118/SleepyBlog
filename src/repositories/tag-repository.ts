import { withDatabaseConnection } from "@/lib/decorators/database";
import ArticleModel from "@/models/Article";
import TagModel from "@/models/Tag";
import type { ITag, TagCreateData, TagQueryOptions, TagUpdateData } from "@/types/tag";

/**
 * 标签数据访问层
 *
 * 提供标签相关的数据库操作方法。
 * 所有方法使用 @withDatabaseConnection() 装饰器确保数据库连接。
 */
export default class TagRepository {
  /**
   * 获取所有标签
   * @param options 查询选项
   * @returns 标签列表
   */
  @withDatabaseConnection()
  static async getAll(options: TagQueryOptions = {}): Promise<ITag[]> {
    const { sortBy = "name", sortOrder = "asc" } = options;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const tags = await TagModel.find({}).sort(sort).lean();

    return tags.map((tag) => ({
      ...tag,
      _id: tag._id.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }));
  }

  /**
   * 获取所有标签（用于文章编辑器）
   * @returns 标签列表
   */
  @withDatabaseConnection()
  static async getActive(): Promise<ITag[]> {
    return await this.getAll({ sortBy: "name", sortOrder: "asc" });
  }

  /**
   * 根据 ID 获取标签
   * @param id 标签 ID
   * @returns 标签对象或 null
   */
  @withDatabaseConnection()
  static async getById(id: string): Promise<ITag | null> {
    const tag = await TagModel.findById(id).lean();

    if (!tag) return null;

    return {
      ...tag,
      _id: tag._id.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  /**
   * 根据 slug 获取标签
   * @param slug 标签 slug
   * @returns 标签对象或 null
   */
  @withDatabaseConnection()
  static async getBySlug(slug: string): Promise<ITag | null> {
    const tag = await TagModel.findOne({ slug }).lean();

    if (!tag) return null;

    return {
      ...tag,
      _id: tag._id.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  /**
   * 根据名称获取标签
   * @param name 标签名称
   * @returns 标签对象或 null
   */
  @withDatabaseConnection()
  static async getByName(name: string): Promise<ITag | null> {
    const tag = await TagModel.findOne({ name }).lean();

    if (!tag) return null;

    return {
      ...tag,
      _id: tag._id.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  /**
   * 创建新标签
   * @param data 标签数据
   * @returns 创建的标签
   */
  @withDatabaseConnection()
  static async create(data: TagCreateData): Promise<ITag> {
    const tag = await TagModel.create(data);

    return {
      ...tag.toObject(),
      _id: tag._id.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  /**
   * 更新标签
   * @param id 标签 ID
   * @param data 更新数据
   * @returns 更新后的标签或 null
   */
  @withDatabaseConnection()
  static async update(id: string, data: TagUpdateData): Promise<ITag | null> {
    const tag = await TagModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!tag) return null;

    return {
      ...tag,
      _id: tag._id.toString(),
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  /**
   * 删除标签
   * @param id 标签 ID
   * @returns 是否删除成功
   */
  @withDatabaseConnection()
  static async delete(id: string): Promise<boolean> {
    const result = await TagModel.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * 批量删除标签
   * @param ids 标签 ID 列表
   * @returns 删除的数量
   */
  @withDatabaseConnection()
  static async bulkDelete(ids: string[]): Promise<number> {
    const result = await TagModel.deleteMany({ _id: { $in: ids } });
    return result.deletedCount || 0;
  }

  /**
   * 同步文章数量（更新每个标签的 articleCount 字段）
   * @returns 是否同步成功
   */
  @withDatabaseConnection()
  static async syncArticleCount(): Promise<boolean> {
    try {
      // 聚合查询获取每个标签的已发布文章数量
      const articleCounts = await ArticleModel.aggregate([
        { $match: { status: "published" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
      ]);

      // 重置所有标签的 articleCount 为 0
      await TagModel.updateMany({}, { $set: { articleCount: 0 } });

      // 更新各标签的实际文章数量
      const bulkOps = articleCounts.map(({ _id, count }) => ({
        updateOne: {
          filter: { name: _id }, // 注意：文章存储的是标签名称，不是 ID
          update: { $set: { articleCount: count } },
        },
      }));

      if (bulkOps.length > 0) {
        await TagModel.bulkWrite(bulkOps);
      }

      return true;
    } catch (error) {
      console.error("Failed to sync article count:", error);
      return false;
    }
  }

  /**
   * 检查标签名称是否已存在
   * @param name 标签名称
   * @param excludeId 排除的标签 ID（用于更新时检查）
   * @returns 是否存在
   */
  @withDatabaseConnection()
  static async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const count = await TagModel.countDocuments(query);
    return count > 0;
  }

  /**
   * 检查 slug 是否已存在
   * @param slug 标签 slug
   * @param excludeId 排除的标签 ID（用于更新时检查）
   * @returns 是否存在
   */
  @withDatabaseConnection()
  static async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const count = await TagModel.countDocuments(query);
    return count > 0;
  }
}
