import { ApiResponder, ApiResponseBuilder } from "@/lib/api-response";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextRequest } from "next/server";

// 获取单个文章
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();

    const { slug } = await params;

    // 查找文章
    const article = await Article.findOne({ slug });

    if (!article) {
      return ApiResponder.notFound("文章不存在");
    }

    // 增加浏览次数
    await Article.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } });

    // 使用类构建器模式
    return ApiResponseBuilder.success(article).withMessage("获取文章成功").send();

    // 或者使用便捷方法
    // return ApiResponder.ok(article, "获取文章成功");
  } catch (error) {
    console.error("获取文章失败:", error);

    // 使用类构建器模式处理错误
    return ApiResponseBuilder.error("获取文章失败", 500)
      .withError(error instanceof Error ? error.message : "未知错误")
      .send();
  }
}

// // 更新文章
// export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
//   try {
//     await connectToDatabase();

//     const { slug } = await params;
//     const body = await request.json();

//     // 查找文章
//     const article = await Article.findOne({ slug });

//     if (!article) {
//       return ApiResponder.notFound("文章不存在");
//     }

//     // 如果更新了内容，重新计算阅读时间
//     if (body.content) {
//       body.readingTime = Math.ceil(body.content.length / 200);
//     }

//     // 更新文章
//     const updatedArticle = await Article.findByIdAndUpdate(article._id, body, { new: true, runValidators: true });

//     return ApiResponder.ok(updatedArticle, "文章更新成功");
//   } catch (error) {
//     console.error("更新文章失败:", error);
//     return ApiResponder.serverError("更新文章失败", error);
//   }
// }

// // 删除文章
// export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
//   try {
//     await connectToDatabase();

//     const { slug } = await params;

//     // 查找并删除文章
//     const article = await Article.findOneAndDelete({ slug });

//     if (!article) {
//       return ApiResponder.notFound("文章不存在");
//     }

//     return ApiResponder.ok(null, "文章删除成功");
//   } catch (error) {
//     console.error("删除文章失败:", error);
//     return ApiResponder.serverError("删除文章失败", error);
//   }
// }
