"use client";

import { motion } from "framer-motion";
import { Heart, Lightbulb, Target, User } from "lucide-react";
import ItemContainer from "../ItemContainer";

// 个人介绍和为什么建站
const myselfIntroduction = [
  {
    icon: User,
    title: "Hello World!",
    content: "我是一名前端开发工程师，目前就职于一家互联网公司",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "热爱编程",
    content: "我热爱编程，喜欢折腾，喜欢学习新技术，喜欢分享",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Lightbulb,
    title: "建站初衷",
    content: "希望通过这个博客记录我的学习历程，分享技术心得，也希望能帮助到其他人",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Target,
    title: "目标导向",
    content: "先完成，再完美;踏上取经路，比抵达灵山更重要",
    color: "from-green-500 to-emerald-500",
  },
];

const MySelf = () => {
  return (
    <ItemContainer title="关于我">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">心路旅程</p>
          <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
            关于我
          </h2>
        </motion.div>

        <div className="space-y-6">
          {myselfIntroduction.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative flex items-start gap-4"
            >
              {/* 时间线连接线 - 精确居中对齐 */}
              {index < myselfIntroduction.length - 1 && (
                <div className="absolute left-[23px] top-12 h-16 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
              )}

              {/* 图标 */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-white shadow-lg`}
              >
                <item.icon size={20} />

                {/* 图标周围的光晕效果 */}
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color} scale-150 opacity-20 blur-sm`}
                />
              </motion.div>

              {/* 内容 */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 p-4 transition-all duration-300 hover:shadow-md dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/50"
                >
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-300">{item.content}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-blue-600 dark:border-blue-800 dark:text-blue-400">
            <Heart size={16} className="text-pink-500" />
            <span>持续学习，永不止步</span>
          </div>
        </motion.div>
      </div>
    </ItemContainer>
  );
};

export default MySelf;
