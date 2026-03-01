import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 管理下拉框的打开/关闭状态
 * 包括点击外部关闭的逻辑
 */
export function useDropdownState(onClose?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  return { isOpen, open, close, toggle, containerRef };
}
