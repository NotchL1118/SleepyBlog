import { getCategories, getTags } from "@/actions/article";
import ArticleListSkeleton from "@/ui/ArticleListSkeleton";
import { Suspense } from "react";
import FilterSection from "./components/FilterSection";
import InfiniteArticleList from "./components/InfiniteArticleList";

export default async function ListPage() {
  // Fetch categories and tags in parallel
  const [categoriesResponse, tagsResponse] = await Promise.all([getCategories(), getTags()]);

  const categories = categoriesResponse.success ? categoriesResponse.data : [];
  const tags = tagsResponse.success ? tagsResponse.data : [];

  return (
    <div className="mx-auto pb-8 sm:w-[54%] md:w-[58%] lg:w-[60%] avoidHeader">
      <h1 className="mb-8 text-2xl font-bold">所有文章</h1>

      <FilterSection categories={categories} tags={tags} />

      <Suspense fallback={<ArticleListSkeleton count={10} />}>
        <InfiniteArticleList />
      </Suspense>
    </div>
  );
}
