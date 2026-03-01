import { useEffect, useRef } from "react";

interface UseArticleKeyboardShortcutsProps {
  /**
   * 保存文章的函数
   * @param status - 文章状态（"draft" | "published"）
   */
  handleSave: (status: "draft" | "published") => void;
  /**
   * 是否正在保存
   */
  isSaving: boolean;
}

/**
 * 文章编辑器键盘快捷键 Hook
 *
 * 支持的快捷键：
 * - Ctrl/Cmd + S: 保存为草稿
 * - Ctrl/Cmd + Enter: 发布文章
 */
export function useArticleKeyboardShortcuts({ handleSave, isSaving }: UseArticleKeyboardShortcutsProps) {
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const isSavingRef = useRef(isSaving);
  isSavingRef.current = isSaving;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S 保存草稿
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isSavingRef.current) {
          handleSaveRef.current("draft");
        }
      }
      // Ctrl/Cmd + Enter 发布文章
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSavingRef.current) {
          handleSaveRef.current("published");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
