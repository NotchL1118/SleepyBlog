"use client";

import { AlertCircle, ChevronDown, ChevronUp, FileText, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ErrorComponent({ error }: { error: Error }) {
  const [showDetails, setShowDetails] = useState(false);

  // Parse error message to provide context-specific guidance
  const getErrorContext = (errorMessage: string) => {
    if (errorMessage.includes("Expected corresponding JSX closing tag")) {
      return {
        title: "MDX 语法错误",
        message: "文章内容中存在未闭合的 JSX 标签，请检查所有标签是否正确闭合。",
      };
    }
    if (errorMessage.includes("Component") || errorMessage.includes("is not defined")) {
      return {
        title: "MDX 组件错误",
        message: "文章中使用了未定义的组件，请确认组件名称是否正确。",
      };
    }
    if (errorMessage.includes("Unexpected token")) {
      return {
        title: "MDX 解析错误",
        message: "文章内容包含无法解析的语法，请检查 Markdown 和 JSX 语法是否正确。",
      };
    }
    return {
      title: "MDX 渲染错误",
      message: "文章内容渲染时发生错误，请联系管理员或稍后重试。",
    };
  };

  const errorContext = getErrorContext(error.message);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Error Alert Box */}
      <div className="rounded-lg border border-red-400 bg-red-50 p-6 shadow-sm dark:border-red-800 dark:bg-red-950/30">
        {/* Icon and Title */}
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300">{errorContext.title}</h2>
          </div>
        </div>

        {/* User-friendly Message */}
        <div className="mb-4 ml-9 text-red-700 dark:text-red-400">
          <p>{errorContext.message}</p>
        </div>

        {/* Collapsible Technical Details */}
        <div className="ml-9">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mb-2 flex items-center gap-2 text-sm font-medium text-red-700 transition-colors hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showDetails ? "隐藏" : "查看"}技术详情
          </button>

          {showDetails && (
            <div className="rounded-md border border-red-300 bg-red-100/50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-800 dark:text-red-400">
                错误信息
              </p>
              <pre className="overflow-x-auto text-sm text-red-900 dark:text-red-300">
                <code>{error.message}</code>
              </pre>
              {error.stack && (
                <>
                  <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-red-800 dark:text-red-400">
                    堆栈跟踪
                  </p>
                  <pre className="overflow-x-auto text-xs text-red-800 dark:text-red-400">
                    <code>{error.stack}</code>
                  </pre>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="ml-9 mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>
          <Link
            href="/list"
            className="inline-flex items-center gap-2 rounded-md border border-red-600 bg-transparent px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <FileText className="h-4 w-4" />
            查看所有文章
          </Link>
        </div>
      </div>
    </div>
  );
}
