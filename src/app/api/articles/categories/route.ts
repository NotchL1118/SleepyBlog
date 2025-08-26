import { ApiResponder, ApiResponseBuilder } from "@/lib/api-response";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextRequest } from "next/server";

// 获取所有文章分类
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // 获取所有已发布文章的分类
    const categories = await Article.distinct("category", { status: "published" });

    // 获取每个分类的文章数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Article.countDocuments({
          category,
          status: "published",
        });
        return { name: category, count };
      })
    );

    const sortedCategories = categoriesWithCount.sort((a, b) => b.count - a.count);

    // 使用类构建器模式
    return ApiResponseBuilder.success(sortedCategories).withMessage("获取分类列表成功").send();
  } catch (error) {
    console.error("获取分类失败:", error);
    return ApiResponder.serverError("获取分类失败", error instanceof Error ? error : new Error(String(error)));
  }
}
