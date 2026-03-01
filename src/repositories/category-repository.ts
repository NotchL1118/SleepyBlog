import { withDatabaseConnection } from "@/lib/decorators/database";
import ArticleModel from "@/models/Article";
import CategoryModel from "@/models/Category";
import type {
  CategoryCreateData,
  CategoryQueryOptions,
  CategoryUpdateData,
  ICategory,
} from "@/types/category";

/**
 * 分类数据访问层
 *
 * 提供分类相关的数据库操作方法。
 * 所有方法使用 @withDatabaseConnection() 装饰器确保数据库连接。
 */
export default class CategoryRepository {
  /**
   * 获取所有分类
   * @param options 查询选项
   * @returns 分类列表
   */
  @withDatabaseConnection()
  static async getAll(options: CategoryQueryOptions = {}): Promise<ICategory[]> {
    const { sortBy = "displayOrder", sortOrder = "asc" } = options;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const categories = await CategoryModel.find({}).sort(sort).lean();

    return categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));
  }

  /**
   * 获取所有分类（用于文章编辑器）
   * @returns 分类列表
   */
  @withDatabaseConnection()
  static async getActive(): Promise<ICategory[]> {
    return await this.getAll({ sortBy: "displayOrder", sortOrder: "asc" });
  }

  /**
   * 根据 ID 获取分类
   * @param id 分类 ID
   * @returns 分类对象或 null
   */
  @withDatabaseConnection()
  static async getById(id: string): Promise<ICategory | null> {
    const category = await CategoryModel.findById(id).lean();

    if (!category) return null;

    return {
      ...category,
      _id: category._id.toString(),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  /**
   * 根据 slug 获取分类
   * @param slug 分类 slug
   * @returns 分类对象或 null
   */
  @withDatabaseConnection()
  static async getBySlug(slug: string): Promise<ICategory | null> {
    const category = await CategoryModel.findOne({ slug }).lean();

    if (!category) return null;

    return {
      ...category,
      _id: category._id.toString(),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  /**
   * 创建新分类
   * @param data 分类数据
   * @returns 创建的分类
   */
  @withDatabaseConnection()
  static async create(data: CategoryCreateData): Promise<ICategory> {
    const category = await CategoryModel.create(data);

    return {
      ...category.toObject(),
      _id: category._id.toString(),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  /**
   * 更新分类
   * @param id 分类 ID
   * @param data 更新数据
   * @returns 更新后的分类或 null
   */
  @withDatabaseConnection()
  static async update(id: string, data: CategoryUpdateData): Promise<ICategory | null> {
    const category = await CategoryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) return null;

    return {
      ...category,
      _id: category._id.toString(),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  /**
   * 删除分类
   * @param id 分类 ID
   * @returns 是否删除成功
   */
  @withDatabaseConnection()
  static async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * 批量删除分类
   * @param ids 分类 ID 列表
   * @returns 删除的数量
   */
  @withDatabaseConnection()
  static async bulkDelete(ids: string[]): Promise<number> {
    const result = await CategoryModel.deleteMany({ _id: { $in: ids } });
    return result.deletedCount || 0;
  }

  /**
   * 更新分类的显示顺序
   * @param reorderData ID 和新顺序的映射数组
   * @returns 是否更新成功
   */
  @withDatabaseConnection()
  static async reorder(reorderData: Array<{ id: string; displayOrder: number }>): Promise<boolean> {
    try {
      const bulkOps = reorderData.map(({ id, displayOrder }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { displayOrder } },
        },
      }));

      await CategoryModel.bulkWrite(bulkOps);
      return true;
    } catch (error) {
      console.error("Failed to reorder categories:", error);
      return false;
    }
  }

  /**
   * 同步文章数量（更新每个分类的 articleCount 字段）
   * @returns 是否同步成功
   */
  @withDatabaseConnection()
  static async syncArticleCount(): Promise<boolean> {
    try {
      // 聚合查询获取每个分类的已发布文章数量
      const articleCounts = await ArticleModel.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      // 重置所有分类的 articleCount 为 0
      await CategoryModel.updateMany({}, { $set: { articleCount: 0 } });

      // 更新各分类的实际文章数量
      const bulkOps = articleCounts.map(({ _id, count }) => ({
        updateOne: {
          filter: { name: _id }, // 注意：文章存储的是分类名称，不是 ID
          update: { $set: { articleCount: count } },
        },
      }));

      if (bulkOps.length > 0) {
        await CategoryModel.bulkWrite(bulkOps);
      }

      return true;
    } catch (error) {
      console.error("Failed to sync article count:", error);
      return false;
    }
  }

  /**
   * 检查分类名称是否已存在
   * @param name 分类名称
   * @param excludeId 排除的分类 ID（用于更新时检查）
   * @returns 是否存在
   */
  @withDatabaseConnection()
  static async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const count = await CategoryModel.countDocuments(query);
    return count > 0;
  }

  /**
   * 检查 slug 是否已存在
   * @param slug 分类 slug
   * @param excludeId 排除的分类 ID（用于更新时检查）
   * @returns 是否存在
   */
  @withDatabaseConnection()
  static async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const count = await CategoryModel.countDocuments(query);
    return count > 0;
  }
}
