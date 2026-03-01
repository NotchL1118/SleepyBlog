import { AlertTriangle } from "lucide-react";
import { memo } from "react";

interface DeleteConfirmationProps {
  categoryName: string;
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

/**
 * 删除确认 UI
 */
export const DeleteConfirmation = memo(function DeleteConfirmation({ categoryName, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <span className="font-medium text-red-700 dark:text-red-400">确认删除 &ldquo;{categoryName}&rdquo;?</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        >
          确认删除
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          取消
        </button>
      </div>
    </div>
  );
});
