import { Plus } from "lucide-react";
import { memo } from "react";

interface HeaderProps {
  onCreateNew: () => void;
}

/**
 * 下拉菜单头部 - 新增分类按钮
 */
export const Header = memo(function Header({ onCreateNew }: HeaderProps) {
  return (
    <div className="border-b border-gray-200 p-3 dark:border-gray-700">
      <button
        onClick={onCreateNew}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 text-sm font-medium text-indigo-700 transition-all duration-200 hover:border-indigo-500 hover:from-indigo-100 hover:to-purple-100 dark:border-indigo-500 dark:from-indigo-900/20 dark:to-purple-900/20 dark:text-indigo-400 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30"
      >
        <Plus className="h-4 w-4" />
        新增分类
      </button>
    </div>
  );
});
