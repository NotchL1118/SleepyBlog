"use client";

import { RefObject, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CloseIcon, TopArrowIcon } from "@/components/Icons";
import { TOCItem } from "./TOCItem";
import { ProgressRing } from "./ProgressRing";
import { useTOC } from "./useTOC";

interface MobileTOCProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

export function MobileTOC({ contentRef }: MobileTOCProps) {
  const { headings, activeId, progress } = useTOC(contentRef);
  const [isOpen, setIsOpen] = useState(false);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsOpen(false);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  // 没有标题时不渲染
  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* 浮动按钮 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 xl:hidden"
      >
        <ProgressRing progress={progress} size={52} strokeWidth={3} />
      </motion.button>

      {/* 遮罩层和抽屉 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 xl:hidden"
            />

            {/* 抽屉面板 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-2xl bg-white p-6 shadow-xl dark:bg-gray-900 xl:hidden"
            >
              {/* 拖拽指示条 */}
              <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600" />

              {/* 标题和关闭按钮 */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">目录</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* 标题列表 */}
              <nav className="max-h-[45vh] space-y-1 overflow-y-auto pr-2">
                {headings.map((heading) => (
                  <TOCItem key={heading.id} item={heading} isActive={activeId === heading.id} onClick={handleItemClick} />
                ))}
              </nav>

              {/* 分割线 */}
              <div className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

              {/* 底部操作 */}
              <div className="flex items-center justify-between">
                <ProgressRing progress={progress} />

                <button
                  onClick={handleBackToTop}
                  className="flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <TopArrowIcon className="h-4 w-4" />
                  <span>返回顶部</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
