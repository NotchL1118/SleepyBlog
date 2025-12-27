import { memo } from "react";

interface DialogFormProps {
  name: string;
  slug: string;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  nameError?: string;
  slugError?: string;
}

/**
 * 对话框表单组件（name 和 slug 输入）
 */
export const DialogForm = memo(function DialogForm({ name, slug, onNameChange, onSlugChange, nameError, slugError }: DialogFormProps) {
  return (
    <>
      {/* 分类名称 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          分类名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="输入分类名称"
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-indigo-400"
          autoFocus
        />
        {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="输入 slug（URL 友好的标识符）"
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-indigo-400"
        />
        {slugError && <p className="mt-1 text-xs text-red-500">{slugError}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">用于 URL 中的唯一标识符，仅支持小写字母、数字和连字符</p>
      </div>
    </>
  );
});
