"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface FullscreenImagePreviewProps {
  isOpen: boolean;
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

export default function FullscreenImagePreview({
  isOpen,
  imageUrl,
  alt = "Preview",
  onClose,
}: FullscreenImagePreviewProps) {
  // ESC 关闭 & 阻止背景滚动
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={1200}
              height={800}
              className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-lg object-contain"
              quality={100}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
