"use client";

import FullscreenImagePreview from "@/components/FullscreenImagePreview";
import useScroll from "@/hooks/useScroll";
import { Check, ImagePlus, Loader2, Maximize2, RefreshCw, Shuffle, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./index.module.scss";

interface AIGenerateCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrompt?: string;
  onRefreshPrompt?: () => string;
  onConfirm: (imageUrl: string) => void;
}

export default function AIGenerateCoverModal({
  isOpen,
  onClose,
  defaultPrompt = "",
  onRefreshPrompt,
  onConfirm,
}: AIGenerateCoverModalProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [imageCount, setImageCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");

  // 禁用全屏滚动
  useScroll(isOpen);

  const modalRef = useRef<HTMLDivElement>(null);
  const generatedCountRef = useRef(0); // 追踪已处理（成功+失败）的图片数量

  // 当弹窗打开时，用 defaultPrompt 初始化
  useEffect(() => {
    if (isOpen) {
      setPrompt(defaultPrompt);
    }
  }, [isOpen, defaultPrompt]);

  // ESC 关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 获取最新概述
  const handleRefreshPrompt = () => {
    if (onRefreshPrompt) {
      const latestPrompt = onRefreshPrompt();
      setPrompt(latestPrompt);
    }
  };

  // 处理数量输入
  const handleCountChange = (value: number) => {
    const clampedValue = Math.min(15, Math.max(1, value));
    setImageCount(clampedValue);
  };

  // AI 生成封面
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // 重置状态
    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedImage(null);
    setFailedIndexes([]);
    setErrorMessage(null);
    generatedCountRef.current = 0;
    setPendingCount(1); // 只显示一个占位符，表示第一张正在生成

    try {
      const response = await fetch("/api/generateArticleCover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxImages: imageCount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "生成失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法获取响应流");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);

            if (event.type === "image_generation.partial_succeeded") {
              const dataUrl = `data:image/jpeg;base64,${event.b64_json}`;
              setGeneratedImages((prev) => [...prev, dataUrl]);
              generatedCountRef.current += 1;
              // 如果还没达到目标数量，保持 1 个占位符；否则清零
              setPendingCount(generatedCountRef.current < imageCount ? 1 : 0);
            }

            if (event.type === "image_generation.partial_failed") {
              setFailedIndexes((prev) => [...prev, event.image_index]);
              generatedCountRef.current += 1;
              // 如果还没达到目标数量，保持 1 个占位符；否则清零
              setPendingCount(generatedCountRef.current < imageCount ? 1 : 0);
            }

            if (event.type === "image_generation.completed") {
              break;
            }
          } catch {
            // 忽略 JSON 解析错误
          }
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "生成失败");
    } finally {
      setIsGenerating(false);
      setPendingCount(0);
    }
  };

  // 选择图片
  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl === selectedImage ? null : imageUrl);
  };

  // 生成随机文件名
  const handleRandomFilename = () => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    setFilename(`cover-${timestamp}`);
  };

  // 确认选择并上传
  const handleConfirm = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setUploadError(null);

    // 生成时间戳 YYYYMMDDHHmm
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const baseName = filename.trim() || "cover";
    const finalFilename = `${baseName}-${timestamp}.jpg`;

    try {
      const response = await fetch("/api/uploadImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: selectedImage,
          filename: finalFilename,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "上传失败");
      }
      onConfirm(result.url);
      onClose();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  // 点击遮罩关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI 生成封面</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Prompt 输入区 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                描述你想要的封面风格
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：一个简洁的科技风格封面，蓝色渐变背景，中心有抽象的几何图形..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-pink-400"
              />
              <button
                onClick={handleRefreshPrompt}
                disabled={!onRefreshPrompt}
                className="mt-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>获取最新概述</span>
              </button>
            </div>

            {/* 生成数量选择器 */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">生成数量</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={imageCount}
                  onChange={(e) => handleCountChange(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-900 transition-colors focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-pink-400"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">(1-15)</span>
                <div className="flex gap-1">
                  {[1, 4, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => setImageCount(num)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        imageCount === num
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 开始生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="group relative mb-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-shadow duration-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>开始生成</span>
                  </>
                )}
              </span>
            </button>

            {/* 图片展示区 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                生成结果
                {isGenerating && ` (${generatedImages.length}/${imageCount})`}
              </label>

              {/* 错误提示 */}
              {errorMessage && (
                <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              {generatedImages.length > 0 || pendingCount > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {/* 已生成的图片 */}
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="group/img relative flex-shrink-0">
                      {/* 全屏预览按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenImage(imageUrl);
                        }}
                        className="absolute right-2 top-2 z-10 rounded-md bg-black/30 p-1.5 text-white opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-black/50"
                        aria-label="全屏预览"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSelectImage(imageUrl)}
                        className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImage === imageUrl
                            ? "border-pink-500 ring-2 ring-pink-500/30"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Generated cover ${index + 1}`}
                          width={208}
                          height={128}
                          className="h-32 w-52 object-cover"
                          unoptimized
                        />
                        {selectedImage === imageUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-pink-500/20">
                            <div className="rounded-full bg-pink-500 p-1.5">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Loading 占位符 - 渐变动画 */}
                  {Array.from({ length: pendingCount }).map((_, index) => (
                    <div
                      key={`loading-${index}`}
                      className="relative h-32 w-52 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                      <div className={`${styles.aiGenerateGradient} absolute inset-0 rounded-lg`} aria-hidden="true" />
                      {/* 内容层 */}
                      <div className="relative flex h-full flex-col items-center justify-center gap-2">
                        <ImagePlus className="h-8 w-8 text-white/80 dark:text-white/60" />
                        <span className="text-sm font-medium text-white/90 dark:text-white/70">图片生成中</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">点击上方按钮开始生成</p>
                  </div>
                </div>
              )}

              {/* 失败图片提示 */}
              {failedIndexes.length > 0 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  {failedIndexes.length} 张图片生成失败（可能包含敏感内容）
                </p>
              )}
            </div>

            {/* 文件名设置 */}
            {selectedImage && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">文件名</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="输入自定义文件名（不含扩展名）"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-pink-400"
                  />
                  <button
                    onClick={handleRandomFilename}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Shuffle className="h-4 w-4" />
                    <span>随机</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">留空将使用默认文件名</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            {/* 上传错误提示 */}
            {uploadError && <span className="text-sm text-red-500 dark:text-red-400">{uploadError}</span>}
            {!uploadError && <div />}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedImage || isUploading}
                className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>上传中...</span>
                  </>
                ) : (
                  "确认选择"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 全屏预览 */}
        <FullscreenImagePreview
          isOpen={!!fullscreenImage}
          imageUrl={fullscreenImage || ""}
          onClose={() => setFullscreenImage(null)}
        />
      </div>
    </>
  );
}
