"use client";

import { motion } from "framer-motion";
import { Code, Database, Globe, Palette, Server, Star } from "lucide-react";
import ItemContainer from "../ItemContainer";

interface TechSkill {
  name: string;
  level: number;
  category: string;
  icon: React.ReactNode;
  color: string;
}

const techSkills: TechSkill[] = [
  {
    name: "React",
    level: 85,
    category: "Frontend",
    icon: <Code size={20} />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Next.js",
    level: 80,
    category: "Frontend",
    icon: <Globe size={20} />,
    color: "from-gray-700 to-gray-900",
  },
  {
    name: "TypeScript",
    level: 75,
    category: "Language",
    icon: <Code size={20} />,
    color: "from-blue-600 to-blue-800",
  },
  {
    name: "Node.js",
    level: 70,
    category: "Backend",
    icon: <Server size={20} />,
    color: "from-green-500 to-green-700",
  },
  {
    name: "MongoDB",
    level: 65,
    category: "Database",
    icon: <Database size={20} />,
    color: "from-green-600 to-green-800",
  },
  {
    name: "TailwindCSS",
    level: 90,
    category: "Styling",
    icon: <Palette size={20} />,
    color: "from-cyan-500 to-blue-500",
  },
];

const TechnologyStack: React.FC = () => {
  const getSkillLevel = (level: number) => {
    if (level >= 80) return { text: "Expert", color: "text-green-600", stars: 5 };
    if (level >= 70) return { text: "Advanced", color: "text-blue-600", stars: 4 };
    if (level >= 60) return { text: "Intermediate", color: "text-yellow-600", stars: 3 };
    if (level >= 40) return { text: "Beginner", color: "text-orange-600", stars: 2 };
    return { text: "Learning", color: "text-gray-600", stars: 1 };
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={`${i < count ? "fill-current text-yellow-400" : "text-gray-300"}`} />
    ));
  };

  return (
    <ItemContainer title="Technology Stack" className="h-full">
      <div className="auto-hide-scrollbar h-[500px] overflow-y-auto">
        <div className="space-y-4">
          {/* 技能概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2 text-center"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">技术栈 & 技能等级</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">持续学习，无限进步</p>
          </motion.div>

          {/* 技能列表 */}
          <div className="space-y-3">
            {techSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl bg-gradient-to-r from-white/50 to-gray-50/50 p-4 transition-all duration-300 hover:shadow-lg dark:from-gray-800/50 dark:to-gray-700/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 技能图标 */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`rounded-lg bg-gradient-to-br p-2 ${skill.color} text-white shadow-md`}
                    >
                      {skill.icon}
                    </motion.div>

                    {/* 技能名称和分类 */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{skill.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{skill.category}</p>
                    </div>
                  </div>

                  {/* 技能等级 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="mb-1 flex items-center justify-end gap-1">
                      {renderStars(getSkillLevel(skill.level).stars)}
                    </div>
                    <p className={`text-xs font-medium ${getSkillLevel(skill.level).color}`}>
                      {getSkillLevel(skill.level).text}
                    </p>
                  </div>
                </div>

                {/* 进度条区域 */}
                <div className="relative mt-3">
                  {/* 进度条标签和百分比 */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">熟练度</span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {skill.level}%
                    </span>
                  </div>

                  {/* 进度条 */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      className={`h-full bg-gradient-to-r ${skill.color} relative`}
                    >
                      {/* 进度条光效 */}
                      <motion.div
                        animate={{ x: [-20, 200] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 top-0 h-full w-4 bg-white/30 blur-sm"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-4 rounded-xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-purple-900/20"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">平均技能等级</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(techSkills.reduce((sum, skill) => sum + skill.level, 0) / techSkills.length)}%
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </ItemContainer>
  );
};

export default TechnologyStack;
