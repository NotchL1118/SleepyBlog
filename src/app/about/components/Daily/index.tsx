"use client";

import { motion } from "framer-motion";
import { Book, Camera, Code, Coffee, Dumbbell, Gamepad2, Moon, Music } from "lucide-react";
import ItemContainer from "../ItemContainer";

interface DailyActivity {
  time: string;
  activity: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const dailyActivities: DailyActivity[] = [
  {
    time: "07:00",
    activity: "晨起",
    icon: <Coffee size={18} />,
    color: "from-amber-500 to-orange-500",
    description: "一杯咖啡开启新的一天",
  },
  {
    time: "09:00",
    activity: "编程",
    icon: <Code size={18} />,
    color: "from-blue-500 to-cyan-500",
    description: "专注于代码，创造美好",
  },
  {
    time: "12:00",
    activity: "学习",
    icon: <Book size={18} />,
    color: "from-green-500 to-emerald-500",
    description: "持续学习新技术",
  },
  {
    time: "15:00",
    activity: "休息",
    icon: <Music size={18} />,
    color: "from-purple-500 to-pink-500",
    description: "听音乐放松心情",
  },
  {
    time: "18:00",
    activity: "运动",
    icon: <Dumbbell size={18} />,
    color: "from-red-500 to-rose-500",
    description: "保持身体健康",
  },
  {
    time: "20:00",
    activity: "娱乐",
    icon: <Gamepad2 size={18} />,
    color: "from-indigo-500 to-purple-500",
    description: "游戏时间，释放压力",
  },
  {
    time: "22:00",
    activity: "摄影",
    icon: <Camera size={18} />,
    color: "from-teal-500 to-cyan-500",
    description: "记录生活美好瞬间",
  },
  {
    time: "23:00",
    activity: "休息",
    icon: <Moon size={18} />,
    color: "from-slate-500 to-gray-600",
    description: "准备进入梦乡",
  },
];

const Daily = () => {
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 0; i < dailyActivities.length; i++) {
      const activityHour = parseInt(dailyActivities[i].time.split(":")[0]);
      if (
        currentHour >= activityHour &&
        (i === dailyActivities.length - 1 || currentHour < parseInt(dailyActivities[i + 1].time.split(":")[0]))
      ) {
        return i;
      }
    }
    return 0;
  };

  const currentActivityIndex = getCurrentTimeSlot();

  return (
    <ItemContainer title="Our Daily">
      <div className="space-y-4">
        {/* 当前活动高亮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2 text-center"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">我的日常生活</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            当前时间段：{dailyActivities[currentActivityIndex].activity}
          </p>
        </motion.div>

        {/* 活动时间线 */}
        <div className="auto-hide-scrollbar max-h-80 space-y-3 overflow-y-auto">
          {dailyActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-center gap-4 rounded-xl p-3 transition-all duration-300 ${
                index === currentActivityIndex
                  ? "scale-105 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg dark:border-blue-700 dark:from-blue-900/30 dark:to-purple-900/30"
                  : "bg-gradient-to-r from-gray-50/50 to-white/50 hover:shadow-md dark:from-gray-800/50 dark:to-gray-700/50"
              }`}
            >
              {/* 时间线连接线 */}
              {index < dailyActivities.length - 1 && (
                <div className="absolute left-8 top-16 h-6 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
              )}

              {/* 时间 */}
              <div className="w-16 flex-shrink-0 text-right">
                <span
                  className={`text-sm font-medium ${
                    index === currentActivityIndex
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {activity.time}
                </span>
              </div>

              {/* 活动图标 */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={
                  index === currentActivityIndex
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={
                  index === currentActivityIndex
                    ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : {}
                }
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${activity.color} text-white shadow-lg`}
              >
                {activity.icon}
              </motion.div>

              {/* 活动内容 */}
              <div className="flex-1 space-y-1">
                <h4
                  className={`font-semibold ${
                    index === currentActivityIndex
                      ? "text-gray-800 dark:text-white"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {activity.activity}
                </h4>
                <p
                  className={`text-sm ${
                    index === currentActivityIndex
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {activity.description}
                </p>
              </div>

              {/* 当前活动指示器 */}
              {index === currentActivityIndex && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                >
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-blue-400 opacity-50"
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 底部统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-6 rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-indigo-800/50 dark:from-indigo-900/20 dark:to-purple-900/20"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">今日进度</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentActivityIndex + 1) / dailyActivities.length) * 100}%` }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {Math.round(((currentActivityIndex + 1) / dailyActivities.length) * 100)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </ItemContainer>
  );
};

export default Daily;
