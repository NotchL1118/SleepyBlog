import { getArticleBySlug } from "@/actions/article";
import ArticleView from "@/components/ArticleView";
import CustomMDXRemote from "@/components/MDXContentRenderer";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // 获取文章内容，增加浏览次数
  const article = (await getArticleBySlug(slug, true))?.data;

  if (!article) {
    notFound();
  }

  return (
    <div className="avoidHeader min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ArticleView article={article} mode="normal">
          {/* 在 Server Component 中渲染 MDX 内容 */}
          <CustomMDXRemote source={article.content} />
        </ArticleView>
      </div>
    </div>
  );
}
