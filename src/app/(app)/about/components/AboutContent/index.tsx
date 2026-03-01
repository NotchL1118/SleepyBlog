"use client";

import { motion } from "framer-motion";
import Daily from "../Daily";
import Goal from "../Goal";
import Info from "../Info";
import Location from "../Location";
import MySelf from "../MySelf";
import TechnologyStack from "../TechnologyStack";

export default function AboutContent() {
  return (
    <div className="avoidHeader relative min-h-screen w-full">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* 主背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/10" />

        {/* 动态背景元素 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-green-400/20 to-cyan-400/20 blur-2xl"
        />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center gap-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 text-center"
        >
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
            👋不一样的烟火
          </h1>
          <p className="text-gray-600 dark:text-gray-400">欢迎来到我的世界</p>
        </motion.div>

        {/* Info 部分 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <Info />
        </motion.div>

        {/* 主要内容区域 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex w-[90%] max-w-7xl flex-col items-center gap-6 lg:w-[1250px]"
        >
          {/* MySelf 部分 */}
          <div className="w-full">
            <MySelf />
          </div>

          {/* 第一行：Goal 和 TechnologyStack - 修复高度一致性问题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex w-full flex-col gap-6 lg:flex-row"
          >
            <div className="min-w-0 flex-1">
              <div className="h-full">
                <Goal />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-full">
                <TechnologyStack />
              </div>
            </div>
          </motion.div>

          {/* 第二行：Location 和 Daily */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex w-full flex-col gap-6 lg:flex-row"
          >
            <div className="min-w-0 flex-1 lg:w-3/5">
              <Location />
            </div>
            <div className="min-w-0 flex-1 lg:w-2/5">
              <Daily />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
