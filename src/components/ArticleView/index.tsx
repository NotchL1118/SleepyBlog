"use client";
import { ReactNode, useRef } from "react";
import TableOfContents from "./TableOfContents";
import { MobileTOC } from "./TableOfContents/MobileTOC";

export interface ArticleViewProps {
  article: {
    title: string;
    content?: string; // 保留用于类型兼容，但不再直接使用
    excerpt?: string;
    tags: string[];
    category: string;
    readingTime?: number;
    publishedAt?: Date | string;
    coverImageUrl?: string;
  };
  mode?: "preview" | "normal";
  className?: string;
  // MDX 渲染内容通过 children 传入（支持 Server Component 和 Client Component）
  children: ReactNode;
  // 未来功能扩展的开关（直接在组件内部实现，不需要外部传入）
  // showToc?: boolean;
  // showProgress?: boolean;
}

export default function ArticleView({ article, mode = "normal", className = "", children }: ArticleViewProps) {
  const isPreviewMode = mode === "preview";
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex gap-8">
      {/* 主文章内容 */}
      <article className={`prose prose-lg dark:prose-invert min-w-0 max-w-none flex-1 ${className}`}>
        {/* 文章头部信息 */}
        <header className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>分类: {article.category || "未分类"}</span>
            {!!article.readingTime && <span>阅读时间: {article.readingTime} 分钟</span>}
            {/* 预览模式不显示发布时间 */}
            {!isPreviewMode && article.publishedAt && (
              <span>发布时间: {new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
            )}
          </div>

          {/* 标签 */}
          {article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 文章摘要 */}
        {article.excerpt && (
          <div className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">摘要</h2>
            <p className="text-gray-700 dark:text-gray-300">{article.excerpt}</p>
          </div>
        )}

        {/* 文章内容 - MDX 渲染内容通过 children 传入 */}
        <div ref={contentRef} className="prose-content">
          {children}
        </div>
      </article>

      {/* 目录侧边栏 - 仅在非预览模式显示 */}
      {!isPreviewMode && <TableOfContents contentRef={contentRef} />}

      {/* 移动端目录 - 仅在非预览模式显示 */}
      {!isPreviewMode && <MobileTOC contentRef={contentRef} />}
    </div>
  );
}
