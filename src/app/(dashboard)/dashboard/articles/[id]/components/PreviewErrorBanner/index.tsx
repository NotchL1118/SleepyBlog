"use client";

import { useState, useMemo } from "react";
import { X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PreviewErrorBannerProps {
  error: string;
  details?: string;
  onDismiss: () => void;
}

/**
 * 预览错误横幅组件 - GitHub警告框风格
 * 显示技术细节，支持展开/收起
 */
export default function PreviewErrorBanner({ details, onDismiss }: PreviewErrorBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 计算错误行数
  const errorLines = useMemo(() => {
    if (!details) return 0;
    return details.split("\n").length;
  }, [details]);

  // 获取预览文本（前3行）
  const previewText = useMemo(() => {
    if (!details) return "";
    const lines = details.split("\n");
    return lines.slice(0, 3).join("\n");
  }, [details]);

  if (!details) return null;

  return (
    <div className="relative flex gap-3 rounded-md border border-orange-300 bg-orange-50 p-4 pl-3 shadow-sm dark:border-orange-700/50 dark:bg-orange-950/20">
      {/* GitHub风格的左侧竖条 */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-orange-500 dark:bg-orange-600" />

      {/* 错误图标 */}
      <div className="flex-shrink-0 pt-0.5">
        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 space-y-2">
        {/* 标题 */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300">MDX 编译错误</h4>

          {/* 关闭按钮 - GitHub简洁风格 */}
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 rounded p-0.5 text-orange-700 transition-colors hover:bg-orange-200/50 dark:text-orange-400 dark:hover:bg-orange-800/40"
            aria-label="关闭错误提示"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 技术细节 */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : "80px" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded border border-orange-200 bg-orange-100/50 p-3 text-xs leading-relaxed text-orange-900 dark:border-orange-800/50 dark:bg-orange-950/30 dark:text-orange-200">
            {isExpanded ? details : previewText}
            {!isExpanded && errorLines > 3 && (
              <span className="text-orange-600 dark:text-orange-500">...</span>
            )}
          </pre>
        </motion.div>

        {/* 展开/收起按钮 - 只在超过3行时显示 */}
        {errorLines > 3 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-200/50 dark:text-orange-400 dark:hover:bg-orange-800/40"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>收起</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>展开查看全部 ({errorLines} 行)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
