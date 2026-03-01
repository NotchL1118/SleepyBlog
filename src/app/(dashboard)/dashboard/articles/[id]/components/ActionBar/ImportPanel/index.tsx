"use client";

import { ArrowDownToLine, Heading, LucideIcon, TextCursor, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ImportOptions {
  appendToBottom: boolean;
  appendAtCursor: boolean;
  replaceTitle: boolean;
}

type OptionKey = keyof ImportOptions;

interface OptionConfig {
  key: OptionKey;
  icon: LucideIcon;
  label: string;
  desc: string;
}

const OPTIONS: OptionConfig[] = [
  { key: "appendToBottom", icon: ArrowDownToLine, label: "追加在内容下方", desc: "在现有内容末尾添加" },
  { key: "appendAtCursor", icon: TextCursor, label: "追加在光标后方", desc: "在当前光标位置插入" },
  { key: "replaceTitle", icon: Heading, label: "替换标题", desc: "用文件名替换当前标题" },
];

interface ImportPanelProps {
  onImport: (options: ImportOptions) => void;
}

export default function ImportPanel({ onImport }: ImportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ImportOptions>({
    appendToBottom: false,
    appendAtCursor: false,
    replaceTitle: true,
  });
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

  const handleOptionChange = (key: OptionKey, checked: boolean) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: checked };
      // 互斥处理：appendToBottom 和 appendAtCursor 只能选一个
      if (key === "appendToBottom" && checked) {
        next.appendAtCursor = false;
      } else if (key === "appendAtCursor" && checked) {
        next.appendToBottom = false;
      }
      return next;
    });
  };

  const handleImport = () => {
    onImport(options);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        title="Import Markdown file"
      >
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">导入</span>
      </button>

      {/* 下拉面板 - 居中对齐 */}
      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-800">
          {/* 小三角指示器 */}
          <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />

          {/* 标题 */}
          <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">导入选项</p>

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
                  onChange={(e) => handleOptionChange(key, e.target.checked)}
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

          {/* 导入按钮 */}
          <button
            onClick={handleImport}
            className="mt-4 w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            选择文件
          </button>
        </div>
      )}
    </div>
  );
}
