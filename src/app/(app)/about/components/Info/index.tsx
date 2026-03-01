"use client";

import { motion } from "framer-motion";
import { Code, Coffee, Heart } from "lucide-react";
import Image from "next/image";

const Info = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mx-auto flex w-[90%] flex-col items-center justify-between gap-8 sm:flex-row lg:w-[950px]"
    >
      {/* 头像部分 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="group relative h-[300px] w-[300px] sm:h-[250px] sm:w-[250px]"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-1 transition-all duration-300 group-hover:rotate-12 group-hover:scale-105">
          <div className="h-full w-full rounded-full bg-white p-2 dark:bg-gray-800">
            <Image
              loading="lazy"
              width={2100}
              height={2100}
              className="h-full w-full rounded-full object-cover shadow-lg transition-all duration-300 group-hover:scale-105"
              src="/images/avatar.png"
              alt="avatar"
            />
          </div>
        </div>
        {/* 装饰性元素 */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
        >
          <Code size={20} />
        </motion.div>
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-lg"
        >
          <Heart size={16} />
        </motion.div>
      </motion.div>

      {/* 文字介绍部分 */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-col items-center justify-center space-y-4 sm:w-[50%] sm:items-start"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent lg:text-5xl"
        >
          Who Am I ?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-2"
        >
          <p className="text-2xl font-bold text-gray-800 lg:text-4xl dark:text-white">
            I am{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SleepYoung
            </span>
            ~
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 1 }}
            className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex items-center gap-2 text-base font-semibold text-gray-600 dark:text-gray-300"
        >
          <Coffee size={18} className="text-amber-500" />
          <span>
            一位目标全栈的
            <span className="mx-1 text-gray-400 line-through">(切图仔)</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent">
              前端工程师
            </span>
          </span>
        </motion.div>

        {/* 技能标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-4 flex flex-wrap gap-2"
        >
          {["React", "Next.js", "TypeScript", "Node.js"].map((skill, index) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.6 + index * 0.1 }}
              className="rounded-full border border-blue-200 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:border-blue-800 dark:text-blue-400"
            >
              {skill}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Info;
