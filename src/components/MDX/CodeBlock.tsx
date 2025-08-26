"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  children,
  language = "javascript",
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = children.split("\n");
  const shouldShowExpandButton = lines.length > 15;

  // 自定义样式，基于 vscDarkPlus 但调整一些颜色
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: "#1e1e1e",
      margin: 0,
      padding: "1rem",
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: "#1e1e1e",
    },
  };

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* 头部区域 - 显示标题、语言和复制按钮 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {title && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>}
          <span className="rounded bg-gray-200 px-2 py-1 text-xs uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{lines.length} 行</span>
          <motion.button
            onClick={copyToClipboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制!
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  复制
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* 代码区域 */}
      <div className="relative">
        <motion.div
          className="relative overflow-hidden"
          animate={{
            height: isExpanded ? "auto" : shouldShowExpandButton ? "400px" : "auto",
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1], // 使用 cubic-bezier 缓动函数
          }}
        >
          {/* 上方虚化效果 */}
          <AnimatePresence>
            {!isExpanded && shouldShowExpandButton && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-6 bg-gradient-to-b from-[#1e1e1e]/50 via-[#1e1e1e]/20 to-transparent"
              />
            )}
          </AnimatePresence>

          {/* 下方虚化效果 */}
          <AnimatePresence>
            {!isExpanded && shouldShowExpandButton && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-8 bg-gradient-to-t from-[#1e1e1e]/60 via-[#1e1e1e]/30 to-transparent"
              />
            )}
          </AnimatePresence>

          <div
            className="overflow-auto"
            style={{
              maxHeight: isExpanded ? "none" : shouldShowExpandButton ? "400px" : "none",
            }}
          >
            <SyntaxHighlighter
              language={language}
              style={customStyle}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                background: "#1e1e1e",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
              lineNumberStyle={{
                color: "#6b7280",
                paddingRight: "1rem",
                userSelect: "none",
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {children}
            </SyntaxHighlighter>
          </div>
        </motion.div>

        {/* 展开按钮 - 只在未展开且需要展开时显示 */}
        <AnimatePresence>
          {shouldShowExpandButton && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-center border-t border-gray-200 bg-gray-50 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <motion.button
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(156, 163, 175, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 rounded-md px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <motion.svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
                <span>展开</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
