"use client";

import ArticleView, { type ArticleViewProps } from "@/components/ArticleView";
import CustomMDXRemoteClient from "@/components/MDXContentRenderer/index.csr";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SerializeResult } from "next-mdx-remote-client/serialize";
import { useEffect } from "react";

export interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Omit<ArticleViewProps["article"], "content">;
  mdxSource: SerializeResult<Record<string, unknown>, Record<string, unknown>>;
}

export default function ArticlePreviewModal({ isOpen, onClose, article, mdxSource }: ArticlePreviewModalProps) {
  // 监听 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* 遮罩层 */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            className="relative z-10 flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl lg:max-w-5xl dark:bg-gray-900"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              aria-label="关闭预览"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 滚动区域 */}
            <div className="flex-1 overflow-y-auto px-12 py-10 [scrollbar-width:none] lg:px-16 [&::-webkit-scrollbar]:hidden">
              <ArticleView article={article} mode="preview">
                {/* 使用客户端版本的 MDX 渲染器 */}
                <CustomMDXRemoteClient mdxSource={mdxSource} />
              </ArticleView>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
