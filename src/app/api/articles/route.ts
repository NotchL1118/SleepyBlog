import { ApiResponseBuilder } from "@/lib/api-response";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextRequest } from "next/server";

// 获取文章列表
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    // 构建查询条件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    // 计算跳过的文档数量
    const skip = (page - 1) * limit;

    // 获取文章列表
    const articles = await Article.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-content"); // 不返回完整内容，只返回摘要

    // 获取总数
    const total = await Article.countDocuments(query);

    const paginationData = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    // 使用类构建器模式 - 链式调用
    return ApiResponseBuilder.paginated(articles, paginationData).withMessage("获取文章列表成功").send();

    // 或者使用便捷方法
    // return ApiResponder.paginated(articles, paginationData, "获取文章列表成功");
  } catch (error) {
    console.error("获取文章列表失败:", error);

    // 使用类构建器模式处理错误
    return ApiResponseBuilder.error("获取文章列表失败", 500)
      .withError(error instanceof Error ? error.message : "未知错误")
      .send();

    // 或者使用便捷方法
    // return ApiResponder.serverError("获取文章列表失败", error);
  }
}

// // 创建新文章
// export async function POST(request: NextRequest) {
//   try {
//     await connectToDatabase();

//     const body = await request.json();
//     const { title, content, excerpt, author, tags = [], category, status = "draft", slug } = body;

//     // 验证必填字段
//     if (!title || !content || !author || !category || !slug) {
//       return ApiResponder.badRequest("标题、内容、作者、分类和slug是必填项");
//     }

//     // 检查slug是否已存在
//     const existingArticle = await Article.findOne({ slug });
//     if (existingArticle) {
//       return ApiResponder.badRequest("URL slug已存在，请使用其他slug");
//     }

//     // 计算阅读时间（按每分钟200字计算）
//     const readingTime = Math.ceil(content.length / 200);

//     // 创建新文章
//     const article = new Article({
//       title,
//       content,
//       excerpt: excerpt || content.substring(0, 200) + "...",
//       author,
//       tags,
//       category,
//       status,
//       slug,
//       readingTime,
//     });

//     await article.save();

//     return ApiResponder.created(article, "文章创建成功");
//   } catch (error) {
//     console.error("创建文章失败:", error);
//     return ApiResponder.serverError("创建文章失败", error);
//   }
// }
