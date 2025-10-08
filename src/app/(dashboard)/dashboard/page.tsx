"use client";

import { getDashboardStats } from "@/actions/article";
import { Calendar, Clock, Eye, FileText, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAuth } from "../components/AuthProvider";
import DashboardLayout from "../components/DashboardLayout";

interface DashboardStats {
  articles: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  views: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
  };
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  recentArticles: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    viewCount: number;
  }>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

function StatsCard({ title, value, icon, trend, subtitle }: StatsCardProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
      <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 shadow-sm hover:shadow-lg dark:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          <div className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-3 shadow-inner">
            <div className="text-indigo-600 dark:text-indigo-400">
              {icon}
            </div>
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center">
            <TrendingUp className={`mr-1 h-4 w-4 ${trend.isPositive ? "text-green-500" : "text-red-500"}`} />
            <span className={`text-sm font-medium ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">vs 上月</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();
        if (result.success) {
          setStats(result.data);
        } else {
          console.error("Failed to fetch dashboard stats:", result.error);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <RequireAuth>
        <DashboardLayout title="仪表板" description="博客数据概览">
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-400"></div>
              <span className="text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <DashboardLayout title="仪表板" description="欢迎回来！这里是您的博客数据概览">
        <div className="space-y-8">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="总文章数"
              value={stats?.articles.total || 0}
              icon={<FileText className="h-6 w-6" />}
              subtitle={`已发布 ${stats?.articles.published || 0} · 草稿 ${stats?.articles.draft || 0}`}
            />

            <StatsCard
              title="总浏览量"
              value={stats?.views.total || 0}
              icon={<Eye className="h-6 w-6" />}
              subtitle={`本月 ${stats?.views.thisMonth || 0}`}
            />

            <StatsCard
              title="文章分类"
              value={stats?.categories.length || 0}
              icon={<Users className="h-6 w-6" />}
            />

            <StatsCard
              title="标签数量"
              value={stats?.tags.length || 0}
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* 最近文章 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
              <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-sm hover:shadow-lg dark:shadow-xl transition-all duration-300">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <Calendar className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                    最近文章
                  </h3>
                </div>
                <div className="p-6">
                  {stats?.recentArticles?.length ? (
                    <div className="space-y-4">
                      {stats.recentArticles.slice(0, 5).map((article) => (
                        <div key={article._id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : article.status === "draft"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                                  : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300"
                            } `}
                          >
                            {article.status === "published" ? "已发布" : article.status === "draft" ? "草稿" : "已归档"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">暂无文章</p>
                  )}
                </div>
              </div>
            </div>

            {/* 热门分类 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
              <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-sm hover:shadow-lg dark:shadow-xl transition-all duration-300">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                    文章分类分布
                  </h3>
                </div>
                <div className="p-6">
                  {stats?.categories?.length ? (
                    <div className="space-y-4">
                      {stats.categories.slice(0, 5).map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" style={{
                              background: `linear-gradient(135deg, hsl(${240 + index * 30}, 70%, 60%), hsl(${260 + index * 30}, 70%, 50%))`
                            }}></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(category.count / (stats?.articles.total || 1)) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="min-w-[2rem] text-sm font-medium text-gray-600 dark:text-gray-400">{category.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">暂无分类数据</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
