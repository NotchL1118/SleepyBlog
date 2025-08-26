import { ApiResponder } from "@/lib/api-response";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextRequest } from "next/server";

// 获取所有文章标签
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // 获取所有已发布文章的标签
    const tags = await Article.distinct("tags", { status: "published" });

    // 获取每个标签的文章数量
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await Article.countDocuments({
          tags: { $in: [tag] },
          status: "published",
        });
        return { name: tag, count };
      })
    );

    const sortedTags = tagsWithCount.sort((a, b) => b.count - a.count);

    // 使用便捷方法
    return ApiResponder.ok(sortedTags, "获取标签列表成功");
  } catch (error) {
    console.error("获取标签失败:", error);
    return ApiResponder.serverError("获取标签失败", error instanceof Error ? error : new Error(String(error)));
  }
}
