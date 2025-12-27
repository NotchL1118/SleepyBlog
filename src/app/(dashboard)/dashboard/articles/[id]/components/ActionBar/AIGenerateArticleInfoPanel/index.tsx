"use client";

import { FileText, Link2, LucideIcon, Sparkles, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type OptionKey = "title" | "slug" | "excerpt" | "coverImage";

// 导出选项类型供 ActionBar 复用
export type GenerateOptions = Record<OptionKey, boolean>;

interface OptionConfig {
  key: OptionKey;
  icon: LucideIcon;
  label: string;
  desc: string;
  defaultChecked: boolean;
}

const OPTIONS: OptionConfig[] = [
  { key: "title", icon: Type, label: "文章标题", desc: "根据内容生成", defaultChecked: true },
  { key: "slug", icon: Link2, label: "URL Slug", desc: "SEO 友好的链接", defaultChecked: true },
  { key: "excerpt", icon: FileText, label: "文章概述", desc: "自动提取摘要", defaultChecked: true },
  // { key: "coverImage", icon: ImageIcon, label: "封面图片", desc: "AI 生成配图", defaultChecked: true },
];

interface AIGeneratePanelProps {
  onGenerate: (options: GenerateOptions) => void;
  isGenerating?: boolean;
}

const initialOptions = OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.key]: opt.defaultChecked }),
  {} as Record<OptionKey, boolean>
);

export default function AIGeneratePanel({ onGenerate, isGenerating = false }: AIGeneratePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(initialOptions);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ESC 关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleGenerate = () => {
    if (isGenerating || !hasSelection) return;
    onGenerate(options);
    setIsOpen(false);
  };

  const hasSelection = options.title || options.slug || options.excerpt || options.coverImage;

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => {
          if (isGenerating) return;
          setIsOpen(!isOpen);
        }}
        disabled={isGenerating}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        title="一键生成 Slug、概述和封面图"
      >
        {isGenerating ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="hidden sm:inline">生成中...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">一键生成</span>
          </>
        )}
      </button>

      {/* 下拉面板 - 居中对齐 */}
      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-800">
          {/* 小三角指示器 */}
          <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />

          {/* 标题 */}
          <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">选择要生成的内容</p>

          {/* 选项列表 */}
          <div className="space-y-1.5">
            {OPTIONS.map(({ key, icon: Icon, label, desc }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) => setOptions((p) => ({ ...p, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600"
                />
                <Icon className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!hasSelection || isGenerating}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>生成中...</span>
              </>
            ) : (
              "开始生成"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
