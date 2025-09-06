import { getArticleList } from "@/actions/article";
import type { Article } from "@/types/article";
import ArticleListSkeleton from "@/ui/ArticleListSkeleton";
import { Suspense } from "react";
import ArticleCard from "./ArticleCard";

interface ArticleListContentProps {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

const ArticleListContent = async ({ page = 1, limit = 10, category, tag, search }: ArticleListContentProps) => {
  const response = await getArticleList({
    page,
    limit,
    status: "published",
    category,
    tag,
    search,
  });

  if (!response.success || !response.data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">暂无文章数据</p>
      </div>
    );
  }

  const { items: articles } = response.data;

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {articles.map((article: Article, index: number) => (
        <ArticleCard
          key={article._id}
          slug={article.slug}
          title={article.title}
          content={article.excerpt || article.content}
          coverImage={article.coverImageUrl}
          mode={index % 2 === 0 ? "normal" : "reverse"}
          date={article.publishedAt || article.createdAt}
          viewCount={article.viewCount}
          category={article.category}
        />
      ))}
    </div>
  );
};

const ArticleList = (props: ArticleListContentProps) => {
  return (
    <Suspense fallback={<ArticleListSkeleton count={props.limit || 4} />}>
      <ArticleListContent {...props} />
    </Suspense>
  );
};

export default ArticleList;
