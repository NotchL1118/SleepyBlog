"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronDown, Circle, Clock, Flame, Target } from "lucide-react";
import { useState } from "react";
import ItemContainer from "../ItemContainer";

interface GoalItem {
  id: number;
  content: string;
  status: "completed" | "pending" | "inProgress";
  progress?: number;
  category?: string;
}

const goals: GoalItem[] = [
  { id: 1, content: "脱单", status: "pending", progress: 0, category: "生活" },
  { id: 2, content: "搭完博客", status: "inProgress", progress: 75, category: "技术" },
  { id: 3, content: "学习英语", status: "inProgress", progress: 40, category: "学习" },
  { id: 4, content: "学习一门新的语言", status: "pending", progress: 10, category: "学习" },
  { id: 5, content: "学习 TailwindCSS", status: "completed", progress: 100, category: "技术" },
  { id: 6, content: "学习 Next.js", status: "inProgress", progress: 85, category: "技术" },
];

const Goal = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const completedGoals = goals.filter((goal) => goal.status === "completed").length;
  const totalGoals = goals.length;
  const overallProgress = Math.round((completedGoals / totalGoals) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={18} />;
      case "inProgress":
        return <Clock className="text-yellow-500" size={18} />;
      default:
        return <Circle className="text-gray-400" size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-500 to-emerald-500";
      case "inProgress":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "技术":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "学习":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "生活":
        return "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const renderDefaultView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col items-center justify-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
          <Target className="text-white" size={32} />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500"
        >
          <Flame className="text-white" size={16} />
        </motion.div>
      </motion.div>

      <div className="space-y-2 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg font-semibold text-gray-800 dark:text-white"
        >
          不畏将来
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg font-semibold text-gray-800 dark:text-white"
        >
          不念过往
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-medium text-transparent"
        >
          LSYFIGHTING.CN
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="space-y-2 text-center"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">总体进度</p>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {completedGoals}/{totalGoals} 已完成
        </p>
      </motion.div>

      {/* 展开按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-blue-600 transition-all duration-300 hover:shadow-md dark:border-blue-800 dark:text-blue-400"
      >
        <span className="text-sm font-medium">查看详情</span>
        <ChevronDown size={16} />
      </motion.button>
    </motion.div>
  );

  const renderGoalListView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col"
    >
      {/* 头部 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">2025年度目标</h3>
        <motion.button
          onClick={() => setIsExpanded(false)}
          className="rounded-full bg-gray-100 p-2 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
          </motion.div>
        </motion.button>
      </div>

      {/* 目标列表 */}
      <div className="auto-hide-scrollbar flex-1 space-y-3 overflow-y-auto">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative flex items-center gap-3 rounded-lg bg-gradient-to-r from-white/50 to-gray-50/50 p-3 transition-all duration-300 hover:shadow-md dark:from-gray-800/50 dark:to-gray-700/50"
          >
            {/* 状态图标 */}
            <div className="flex-shrink-0">{getStatusIcon(goal.status)}</div>

            {/* 内容 */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${goal.status === "completed" ? "text-gray-500 line-through" : "text-gray-900 dark:text-white"}`}
                >
                  {goal.id}、{goal.content}
                </span>
                {goal.category && (
                  <span className={`rounded-full px-2 py-1 text-xs ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>
                )}
              </div>

              {/* 进度条 */}
              {goal.progress !== undefined && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`h-full bg-gradient-to-r ${getStatusColor(goal.status)}`}
                  />
                </div>
              )}
            </div>

            {/* 进度百分比 */}
            {goal.progress !== undefined && (
              <div className="flex-shrink-0">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{goal.progress}%</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <ItemContainer title="2025年度目标" className="h-full">
      <div className="relative h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <div key="default" className="h-full">
              {renderDefaultView()}
            </div>
          ) : (
            <div key="expanded" className="h-full">
              {renderGoalListView()}
            </div>
          )}
        </AnimatePresence>
      </div>
    </ItemContainer>
  );
};

export default Goal;
