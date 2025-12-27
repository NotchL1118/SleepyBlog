import GlowCard from "@/components/GlowCard";
import { IDashboardStats } from "@/types/dashboard";
import { Calendar, Clock, Eye } from "lucide-react";

interface RecentArticlesProps {
  recentArticles: IDashboardStats["recentArticles"];
}

const STATUS_TEXT_MAP = {
  published: "已发布",
  draft: "草稿",
  archived: "已归档",
} as const;

export default function RecentArticles({ recentArticles }: RecentArticlesProps) {
  return (
    <>
      <GlowCard glowFrom="green-500" glowTo="blue-600">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Calendar className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
            最近文章
          </h3>
        </div>
        <div className="p-6">
          {recentArticles?.length ? (
            <div className="space-y-4">
              {recentArticles.slice(0, 5).map((article) => (
                <div
                  key={article._id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{article.title}</p>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(article.createdAt).toLocaleDateString()}
                      <span className="mx-2">·</span>
                      <Eye className="mr-1 h-3 w-3" />
                      {article.viewCount} 浏览
                    </div>
                  </div>
                  <span
                    className={`ml-3 rounded-full px-3 py-1 text-xs font-medium ${
                      article.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : article.status === "draft"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                    } `}
                  >
                    {STATUS_TEXT_MAP[article.status as keyof typeof STATUS_TEXT_MAP]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">暂无文章</p>
          )}
        </div>
      </GlowCard>
    </>
  );
}
