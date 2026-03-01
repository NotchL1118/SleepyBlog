import { ChevronDown, Search, X } from "lucide-react";
import { memo } from "react";

interface InputActionsProps {
  isOpen: boolean;
  hasValue: boolean;
  hasSearchQuery: boolean;
  allowClear: boolean;
  disabled: boolean;
  onClear: () => void;
  onClearSearch: () => void;
}

/**
 * 输入框右侧的操作按钮
 */
export const InputActions = memo(function InputActions({
  isOpen,
  hasValue,
  hasSearchQuery,
  allowClear,
  disabled,
  onClear,
  onClearSearch,
}: InputActionsProps) {
  return (
    <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
      {/* 清空选中值按钮（仅在关闭状态显示） */}
      {allowClear && hasValue && !disabled && !isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
          aria-label="清空"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* 清空搜索按钮（仅在打开状态且有搜索内容时显示） */}
      {isOpen && hasSearchQuery && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClearSearch();
          }}
          className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
          aria-label="清空搜索"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* 搜索/下拉图标 */}
      {isOpen ? (
        <Search className="h-4 w-4 text-gray-400" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
      )}
    </div>
  );
});
