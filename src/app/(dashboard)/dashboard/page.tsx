"use client";

import { getDashboardStats } from "@/actions/dashboard";
import GlowCard from "@/components/GlowCard";
import { IDashboardStats } from "@/types/dashboard";
import { Eye, FileText, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import CategoryList from "../_components/CategoryList";
import RecentArticles from "../_components/RecentArticles";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

function StatsCard({ title, value, icon, subtitle }: StatsCardProps) {
  return (
    <GlowCard className="h-fit">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          <div className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 p-3 shadow-inner dark:from-indigo-900/30 dark:to-purple-900/30">
            <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();
        if (result.success) {
          setStats(result.data);
        } else {
          console.error("Failed to fetch dashboard stats:", result.message);
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
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-400"></div>
          <span className="text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="总文章数"
          value={stats?.articles.total || 0}
          icon={<FileText className="h-6 w-6" />}
          subtitle={`已发布 ${stats?.articles.published || 0} · 草稿 ${stats?.articles.draft || 0}`}
        />

        <StatsCard title="总浏览量" value={stats?.views.total || 0} icon={<Eye className="h-6 w-6" />} />

        <StatsCard title="文章分类" value={stats?.categories.length || 0} icon={<Users className="h-6 w-6" />} />

        <StatsCard title="标签数量" value={stats?.tags.length || 0} icon={<TrendingUp className="h-6 w-6" />} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 最近文章 */}
        <RecentArticles recentArticles={stats?.recentArticles || []} />

        {/* 文章分类分布 */}
        <CategoryList categories={stats?.categories || []} totalArticles={stats?.articles.total || 0} />
      </div>
    </div>
  );
}
