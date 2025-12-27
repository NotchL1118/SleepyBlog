import { X } from "lucide-react";
import { memo, useEffect } from "react";

interface BaseDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitText: string;
  submitDisabled: boolean;
  isSubmitting: boolean;
  children: React.ReactNode;
}

/**
 * 对话框基础组件，封装公共的对话框结构和行为
 * CreateDialog 和 EditDialog 都基于此组件
 */
export const BaseDialog = memo(function BaseDialog({
  isOpen,
  title,
  onClose,
  onSubmit,
  submitText,
  submitDisabled,
  isSubmitting,
  children,
}: BaseDialogProps) {
  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />

      {/* 对话框内容 */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        {/* 头部 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="space-y-4">{children}</div>

        {/* 底部按钮 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={submitDisabled || isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isSubmitting ? "处理中..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
});
