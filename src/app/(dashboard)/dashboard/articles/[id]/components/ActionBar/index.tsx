"use client";

import { Archive, CheckCircle2, Eye, FileEdit, ImagePlus, Send } from "lucide-react";
import AIGeneratePanel, { type GenerateOptions } from "./AIGenerateArticleInfoPanel";
import ImportPanel, { type ImportOptions } from "./ImportPanel";

interface ActionBarProps {
  status: "draft" | "published" | "archived";
  isSaving: boolean;
  isGenerating: boolean;
  onPublish: () => void;
  onImport: (options: ImportOptions) => void;
  onPreview: () => void;
  onGenerate: (options: GenerateOptions) => void;
  onGenerateCover: () => void;
}

export default function ActionBar({
  status,
  isSaving,
  isGenerating,
  onPublish,
  onImport,
  onPreview,
  onGenerate,
  onGenerateCover,
}: ActionBarProps) {
  // 获取状态徽章样式
  const getStatusBadge = (status: ActionBarProps["status"]) => {
    const badges = {
      draft: {
        text: "草稿",
        icon: FileEdit,
        className:
          "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
      },
      published: {
        text: "已发布",
        icon: CheckCircle2,
        className:
          "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
      },
      archived: {
        text: "已归档",
        icon: Archive,
        className:
          "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
      },
    };
    return badges[status];
  };

  const statusBadge = getStatusBadge(status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="px-4 pb-2 pt-1">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Left: Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-colors ${statusBadge.className}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{statusBadge.text}</span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Import Panel */}
          <ImportPanel onImport={onImport} />

          {/* Preview Button - Placeholder */}
          <button
            onClick={onPreview}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            title="Preview Article"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">预览</span>
          </button>

          {/* AI Generate Cover Button */}

          {/* AI Generate Panel */}
          <AIGeneratePanel onGenerate={onGenerate} isGenerating={isGenerating} />

          <button
            onClick={onGenerateCover}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-pink-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            title="AI 生成封面"
          >
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">封面生成</span>
          </button>

          {/* Publish Button - Functional */}
          <button
            onClick={onPublish}
            disabled={isSaving}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            title="发布文章 (Ctrl/Cmd + Enter)"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>发布中...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>发布</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
