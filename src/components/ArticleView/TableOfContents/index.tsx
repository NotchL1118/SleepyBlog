"use client";

import { RefObject, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { TopArrowIcon } from "@/components/Icons";
import { TOCItem } from "./TOCItem";
import { ProgressRing } from "./ProgressRing";
import { useTOC } from "./useTOC";

interface TableOfContentsProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

export default function TableOfContents({ contentRef }: TableOfContentsProps) {
  const { headings, activeId, progress } = useTOC(contentRef);
  const navRef = useRef<HTMLElement>(null);

  // 自动滚动到激活的标题
  useEffect(() => {
    if (activeId && navRef.current) {
      const activeElement = navRef.current.querySelector(`[data-id="${activeId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeId]);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 没有标题时不渲染
  if (headings.length === 0) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="sticky top-24 hidden h-fit max-h-[calc(100vh-96px)] w-56 shrink-0 xl:block"
    >
      <div className="flex flex-col gap-4">
        {/* 标题列表 */}
        <nav
          ref={navRef}
          className="max-h-[calc(100vh-200px)] space-y-1 overflow-y-auto scrollbar-none"
        >
          {headings.map((heading) => (
            <TOCItem key={heading.id} item={heading} isActive={activeId === heading.id} />
          ))}
        </nav>

        {/* 分割线 */}
        <div className="h-px bg-gray-200 dark:bg-gray-700" />

        {/* 底部：进度 + 返回顶部 */}
        <div className="flex items-center justify-between">
          <ProgressRing progress={progress} />

          <button
            onClick={handleBackToTop}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
            title="返回顶部"
          >
            <TopArrowIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
