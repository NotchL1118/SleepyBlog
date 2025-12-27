import type { ICategory } from "@/types/category";
import { Check, Edit, Trash2 } from "lucide-react";
import { memo } from "react";
import { DeleteConfirmation } from "./DeleteConfirmation";

interface CategoryItemProps {
  category: ICategory;
  isSelected: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: (e: React.MouseEvent) => void;
  onCancelDelete: (e: React.MouseEvent) => void;
}

/**
 * 单个分类项组件
 */
export const CategoryItem = memo(function CategoryItem({
  category,
  isSelected,
  isDeleting,
  onSelect,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: CategoryItemProps) {
  if (isDeleting) {
    return (
      <div className="group flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 text-sm ring-2 ring-red-200 transition-all duration-200 dark:bg-red-900/20 dark:ring-red-800">
        <DeleteConfirmation categoryName={category.name} onConfirm={onConfirmDelete} onCancel={onCancelDelete} />
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <button onClick={onSelect} className="flex flex-1 items-center gap-2.5 text-left">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
          {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
        </div>
        <span className={`flex-1 ${isSelected ? "font-medium text-indigo-700 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"}`}>
          {category.name}
        </span>
        {category.articleCount > 0 && <span className="text-xs text-gray-400 dark:text-gray-500">({category.articleCount})</span>}
      </button>

      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="rounded p-1.5 text-gray-400 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
          title="编辑"
        >
          <Edit className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="删除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
});
