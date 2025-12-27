"use client";

import FullscreenImagePreview from "@/components/FullscreenImagePreview";
import { Check, Copy, ImageIcon, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImagePreviewProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
}

function isBase64Image(str: string): boolean {
  return str.startsWith("data:image/");
}

function isValidImageSource(url: string): boolean {
  const trimmed = url.trim();
  if (isBase64Image(trimmed)) {
    return true;
  }
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function generateImageKey(url: string): string {
  if (isBase64Image(url)) {
    return `base64-${url.slice(0, 20)}-${url.length}`;
  }
  return url;
}

export default function ImagePreview({ imageUrl, alt = "Preview", className = "" }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [debouncedUrl, setDebouncedUrl] = useState(imageUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 只有当 URL 实际变化时才需要重置状态
    if (imageUrl === debouncedUrl) {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedUrl(imageUrl);
      setIsLoading(true);
      setHasError(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [imageUrl, debouncedUrl]);

  const isUrlValid = debouncedUrl?.trim() ? isValidImageSource(debouncedUrl.trim()) : false;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!debouncedUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(debouncedUrl);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = debouncedUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!imageUrl?.trim()) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50 ${className}`}
        style={{ minHeight: "200px" }}
      >
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">暂无封面图片</p>
        </div>
      </div>
    );
  }

  if (!isUrlValid) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 ${className}`}
        style={{ minHeight: "200px" }}
      >
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" />
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">无效的图片链接</p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-500">请输入有效的 URL 地址</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`group relative overflow-hidden rounded-lg ${className}`} style={{ minHeight: "200px" }}>
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
          </div>
        )}

        {hasError ? (
          <div
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
            style={{ minHeight: "200px" }}
          >
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" />
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">图片加载失败</p>
              <p className="mt-1 text-xs text-red-500 dark:text-red-500">请检查图片链接是否有效</p>
            </div>
          </div>
        ) : (
          <>
            <Image
              width={100}
              height={100}
              src={debouncedUrl!}
              alt={alt}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={() => !isLoading && setShowFullscreen(true)}
              key={generateImageKey(debouncedUrl!)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "cursor-pointer opacity-100 hover:opacity-90"
              }`}
              style={{ maxHeight: "200px" }}
            />
            {!isLoading && (
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={handleCopyUrl}
                  className="rounded-md bg-black/50 p-1.5 text-white hover:bg-black/70"
                  title="复制链接"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullscreen(true);
                  }}
                  className="rounded-md bg-black/50 p-1.5 text-white hover:bg-black/70"
                  title="全屏预览"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen Preview */}
      <FullscreenImagePreview
        isOpen={showFullscreen}
        imageUrl={debouncedUrl!}
        alt={alt}
        onClose={() => setShowFullscreen(false)}
      />
    </>
  );
}
