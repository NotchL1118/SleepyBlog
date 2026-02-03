"use client";

import { motion } from "motion/react";
import type { TOCHeading } from "./types";

interface TOCItemProps {
  item: TOCHeading;
  isActive: boolean;
  onClick?: () => void;
}

// 层级缩进映射
const INDENT_MAP: Record<number, string> = {
  1: "pl-0",
  2: "pl-0",
  3: "pl-4",
  4: "pl-8",
};

export function TOCItem({ item, isActive, onClick }: TOCItemProps) {
  const handleClick = () => {
    const element = document.getElementById(item.id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });
    }
    onClick?.();
  };

  return (
    <motion.div
      data-id={item.id}
      className={`relative ${INDENT_MAP[item.level]}`}
      animate={{
        x: isActive ? 8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8,
      }}
    >
      {/* 激活指示条 */}
      <motion.div
        className="absolute -left-3 top-0 h-full w-0.5 rounded-full bg-blue-500"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{
          scaleY: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        style={{ originY: 0.5 }}
      />

      <button
        onClick={handleClick}
        className={`block w-full truncate py-1.5 text-left text-sm transition-colors duration-200 ${
          isActive
            ? "font-medium text-blue-600 dark:text-blue-400"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        } ${item.level <= 2 ? "font-medium" : "font-normal"}`}
      >
        {item.text}
      </button>
    </motion.div>
  );
}
