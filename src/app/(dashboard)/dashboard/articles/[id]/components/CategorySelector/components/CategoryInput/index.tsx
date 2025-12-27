import { memo, useEffect, useRef } from "react";
import { InputActions } from "./InputActions";

interface CategoryInputProps {
  value: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClear: () => void;
  placeholder: string;
  disabled: boolean;
  allowClear: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * 分类选择器输入框组件
 * 优化的搜索交互：打开时显示搜索词，关闭时显示选中值
 */
export const CategoryInput = memo(function CategoryInput({
  value,
  searchQuery,
  onSearchChange,
  isOpen,
  onOpen,
  onClear,
  placeholder,
  disabled,
  allowClear,
  onKeyDown,
}: CategoryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 显示值：打开时显示搜索词，关闭时显示选中值
  const displayValue = isOpen ? searchQuery : value;

  // placeholder：打开时显示搜索提示（如有选中值则包含提示），关闭时显示默认提示
  const displayPlaceholder = isOpen ? (value ? `${value}` : "搜索分类...") : value ? "" : placeholder;

  const hasValue = Boolean(value);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        onClick={onOpen}
        readOnly={!isOpen}
        disabled={disabled}
        placeholder={displayPlaceholder}
        className={`flex w-full items-center rounded-xl border-2 px-4 py-2.5 pr-20 text-sm transition-all duration-200 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : isOpen
              ? "cursor-text border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-900/20 dark:ring-indigo-400/20"
              : "cursor-pointer border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-indigo-500 dark:hover:bg-gray-700"
        } ${
          hasValue && !isOpen
            ? "font-medium text-gray-900 dark:text-gray-100"
            : !value && !isOpen
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-900 dark:text-gray-100"
        }`}
      />

      <InputActions
        isOpen={isOpen}
        hasValue={hasValue}
        hasSearchQuery={Boolean(searchQuery)}
        allowClear={allowClear}
        disabled={disabled}
        onClear={onClear}
        onClearSearch={() => onSearchChange("")}
      />
    </div>
  );
});
