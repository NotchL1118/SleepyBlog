"use client";

import { motion } from "framer-motion";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

const ItemContainer: FC<PropsWithChildren<{ title?: string; className?: string }>> = ({
  title,
  children,
  className,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-900/80 ${className}`}
    >
      {/* 鼠标跟随圆形阴影 - 主要大圆 */}
      <motion.div
        className="pointer-events-none absolute z-0 rounded-full"
        style={{
          left: mousePosition.x - 120,
          top: mousePosition.y - 120,
          width: 240,
          height: 240,
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 25%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.05) 75%, transparent 100%)",
          filter: "blur(12px)",
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? [0.6, 1.3, 1] : 0.6,
        }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.8, ease: "easeOut" },
        }}
      />

      {/* 装饰性背景元素 */}
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-xl transition-all duration-300 group-hover:scale-150" />
      <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-lg transition-all duration-300 group-hover:scale-150" />

      {/* 鼠标跟随圆形阴影 - 中等圆 */}
      <motion.div
        className="pointer-events-none absolute z-0 rounded-full"
        style={{
          left: mousePosition.x - 80,
          top: mousePosition.y - 80,
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, rgba(168, 85, 247, 0.08) 70%, transparent 100%)",
          filter: "blur(8px)",
        }}
        animate={{
          opacity: isHovered ? 0.9 : 0,
          scale: isHovered ? [0.7, 1.2, 1.1] : 0.7,
        }}
        transition={{
          opacity: { duration: 0.2 },
          scale: { duration: 0.6, ease: "easeOut" },
        }}
      />

      {/* 鼠标跟随圆形阴影 - 小圆核心 */}
      <motion.div
        className="pointer-events-none absolute z-0 rounded-full"
        style={{
          left: mousePosition.x - 50,
          top: mousePosition.y - 50,
          width: 100,
          height: 100,
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 100%)",
          filter: "blur(6px)",
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0,
          scale: isHovered ? [0.8, 1.1, 0.95] : 0.8,
        }}
        transition={{
          opacity: { duration: 0.15 },
          scale: { duration: 0.4, ease: "easeOut" },
        }}
      />

      <div className="relative z-10 p-6">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 text-center"
          >
            <h3 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-semibold text-transparent dark:from-blue-400 dark:to-purple-400">
              {title}
            </h3>
            <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ItemContainer;
