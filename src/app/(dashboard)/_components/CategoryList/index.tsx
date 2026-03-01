import GlowCard from "@/components/GlowCard";
import { TrendingUp } from "lucide-react";

interface CategoryListProps {
  categories: Array<{ name: string; count: number }>;
  totalArticles: number;
}

export default function CategoryList({ categories, totalArticles }: CategoryListProps) {
  return (
    <GlowCard glowFrom="purple-500" glowTo="pink-600">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
            文章分类分布
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">共 {totalArticles} 篇文章</p>
        </div>
      </div>
      <div className="p-6">
        {categories?.length ? (
          <div className="space-y-4">
            {categories.slice(0, 5).map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
              >
                <div className="flex flex-1 items-center space-x-3">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                    style={{
                      background: `linear-gradient(135deg, hsl(${240 + index * 30}, 70%, 60%), hsl(${260 + index * 30}, 70%, 50%))`,
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{
                        width: `${(category.count / (totalArticles || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="min-w-[2rem] text-sm font-medium text-gray-600 dark:text-gray-400">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">暂无分类数据</p>
        )}
      </div>
    </GlowCard>
  );
}
