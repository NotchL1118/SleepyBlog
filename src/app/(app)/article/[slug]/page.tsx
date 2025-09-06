import { getArticle } from "@/actions/article";
import { mdxComponents } from "@/mdx-components";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // 获取文章内容，增加浏览次数
  const article = (await getArticle(slug, true))?.data;

  if (!article) {
    notFound();
  }

  return (
    <div className="avoidHeader min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {/* 文章头部信息 */}
          <header className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>分类: {article.category}</span>
              {article.readingTime && <span>阅读时间: {article.readingTime} 分钟</span>}
              <span>浏览: {article.viewCount} 次</span>
              <span>点赞: {article.likeCount} 次</span>
              {article.publishedAt && (
                <span>发布时间: {new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
              )}
            </div>

            {/* 标签 */}
            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 文章摘要 */}
          {article.excerpt && (
            <div className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">摘要</h2>
              <p className="text-gray-700 dark:text-gray-300">{article.excerpt}</p>
            </div>
          )}

          {/* 文章内容 - 使用 MDX 渲染 */}
          <div className="prose-content">
            <MDXRemote
              source={article.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
