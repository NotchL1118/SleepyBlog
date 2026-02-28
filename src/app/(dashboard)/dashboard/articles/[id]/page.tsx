"use client";

import { createArticle, getArticleById, serializeMarkdownForPreview, updateArticle } from "@/actions/dashboard";
import { generateArticleInfoByAgent } from "@/agents/generateSlugAgent";
import ArticlePreviewModal from "@/components/ArticlePreviewModal";
import { useArticleKeyboardShortcuts } from "@/hooks/useArticleKeyboardShortcuts";
import { useForm } from "@/hooks/useForm";
import type { IArticle } from "@/types/article";
import { insertModal } from "@/utils/insert-modal";
import triggerMarkdownImport from "@/utils/markdown-import";
import { message } from "@/utils/message-info";
import { calculateReadingTime } from "@/utils/reading-time";
import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import ActionBar from "./components/ActionBar";
import { GenerateOptions } from "./components/ActionBar/AIGenerateArticleInfoPanel";
import AIGenerateCoverModal from "./components/ActionBar/AIGenerateCoverModal";
import type { ImportOptions } from "./components/ActionBar/ImportPanel";
import CategorySelector from "./components/CategorySelector";
import ImagePreview from "./components/ImagePreview";
import PreviewErrorBanner from "./components/PreviewErrorBanner";
import TagSelector from "./components/TagSelector";

// Zod Schema 定义
const articleFormSchema = z.object({
  title: z.string().min(1, "请输入文章标题"),
  content: z.string().min(1, "请输入文章内容"),
  excerpt: z.string(),
  tags: z.array(z.string()),
  category: z.string().min(1, "请选择文章分类"),
  status: z.enum(["draft", "published", "archived"]),
  slug: z
    .string()
    .min(1, "请输入URL slug")
    .regex(/^[a-z0-9-]+$/, "URL slug只能包含小写字母、数字和连字符"),
  coverImageUrl: z.string().optional().default(""),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

export default function ArticleEditorPage() {
  const router = useRouter();
  const params = useParams() as { id?: string } | null;
  const articleId = params?.id;
  const isEditing = Boolean(articleId && articleId !== "new");

  // 使用 useForm hook 管理表单状态
  const { values, errors, handleChange, setFieldValue, setValues, validate, clearFieldError, reset } = useForm({
    schema: articleFormSchema,
    initialValues: {
      title: "",
      content: "",
      excerpt: "",
      tags: [] as string[],
      category: "",
      status: "draft" as const,
      slug: "",
      coverImageUrl: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<{ message: string; details?: string } | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取文章数据（编辑模式）
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditing || !articleId) return;

      try {
        setIsLoading(true);
        const result = await getArticleById(articleId);
        if (result.success && result.data) {
          const article = result.data as IArticle;
          reset({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt || "",
            tags: article.tags,
            category: article.category,
            status: article.status,
            slug: article.slug,
            coverImageUrl: article.coverImageUrl || "",
          });
        } else {
          throw new Error(result.message || "文章不存在");
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
        message.error("获取文章失败");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId, isEditing, reset]);

  // 保存文章
  const handleSave = async (status?: ArticleFormData["status"]) => {
    const saveData = status ? { ...values, status } : values;

    // 使用 useForm 的 validate 方法进行表单验证
    if (!validate()) return;

    // MDX内容验证 - 在保存前序列化内容以检查语法错误
    const serializeResult = await serializeMarkdownForPreview(saveData.content);

    if (!serializeResult.success || !serializeResult.data) {
      // 序列化失败
      const errorMsg = serializeResult.message || "无法编译 Markdown，请检查语法";
      setPreviewError({ message: errorMsg, details: serializeResult.message });
      message.error("内容包含语法错误，无法保存");
      return;
    }

    const mdxSource = serializeResult.data;

    // 检查序列化结果是否包含错误
    if ("error" in mdxSource) {
      const errorMsg = mdxSource.error.message || "MDX 编译错误";
      const errorDetails = mdxSource.error.stack || JSON.stringify(mdxSource.error, null, 2);
      setPreviewError({ message: errorMsg, details: errorDetails });
      message.error("内容包含语法错误，无法保存");
      console.error("MDX compilation error:", mdxSource.error);
      return;
    }

    // 序列化成功，清除错误状态
    setPreviewError(null);

    try {
      setIsSaving(true);

      const result =
        isEditing && articleId ? await updateArticle(articleId, saveData) : await createArticle(saveData as IArticle);

      if (result.success) {
        message.success(result.message || "保存成功,即将跳转管理页");
        // 新建或编辑成功后延时返回文章管理页面，让用户看到成功提示
        setTimeout(() => {
          router.push("/dashboard/articles");
        }, 1000);
      } else {
        message.error(result.message || "保存失败");
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error("保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 键盘快捷键
  useArticleKeyboardShortcuts({ handleSave, isSaving });

  // 处理AI生成文章信息
  const handleAIGenerate = async (options: GenerateOptions) => {
    try {
      setIsAIGenerating(true);
      const result = await generateArticleInfoByAgent(values.content, articleId);
      if (result.success) {
        message.success("文章信息生成成功");
        console.log("result", result);
        const updates: Partial<ArticleFormData> = {};
        if (options.title) updates.title = result.title;
        if (options.slug) updates.slug = result.slug;
        if (options.excerpt) updates.excerpt = result.excerpt;
        setValues(updates);
      } else {
        message.error(result.error ? `生成失败: ${result.error}` : "文章信息生成失败");
      }
    } catch (error) {
      message.error("文章信息生成失败: " + (error as Error).message);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // 处理Markdown导入
  const handleImport = async (options: ImportOptions) => {
    const result = await triggerMarkdownImport();

    if (result.success && result.content) {
      const importedContent = result.content;

      let newContent: string;
      if (options.appendToBottom) {
        // 追加在内容下方
        newContent = values.content.trim() ? `${values.content}\n\n${importedContent}` : importedContent;
      } else if (options.appendAtCursor) {
        // 追加在当前光标后方
        const textarea = contentTextareaRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const before = values.content.slice(0, cursorPos);
          const after = values.content.slice(cursorPos);
          newContent = `${before}${importedContent}${after}`;
        } else {
          // 如果无法获取光标位置，默认追加到末尾
          newContent = values.content.trim() ? `${values.content}\n\n${importedContent}` : importedContent;
        }
      } else {
        // 替换全部内容
        newContent = importedContent;
      }

      // 根据 replaceTitle 选项决定是否替换标题
      const updates: Partial<ArticleFormData> = { content: newContent };
      if (options.replaceTitle && result.title) {
        updates.title = result.title;
      }
      setValues(updates);

      message.success("导入成功！");
    } else if (result.error !== "Import cancelled") {
      message.error(`导入失败: ${result.error || "未知错误"}`);
    }
  };

  // 处理预览
  const handlePreview = async () => {
    // 基础验证
    if (!values.title?.trim()) {
      message.error("请先输入文章标题");
      return;
    }

    if (!values.content?.trim()) {
      message.error("请先输入文章内容");
      return;
    }

    // 序列化 markdown 为 MDX
    const serializeResult = await serializeMarkdownForPreview(values.content);

    if (!serializeResult.success || !serializeResult.data) {
      // 编译失败，设置错误但不打开modal
      const errorMsg = serializeResult.message || "无法编译 Markdown";
      setPreviewError({ message: errorMsg, details: serializeResult.message });
      return;
    }

    const mdxSource = serializeResult.data;

    // 检查序列化结果是否包含错误
    if ("error" in mdxSource) {
      const errorMsg = mdxSource.error.message || "MDX 编译错误";
      const errorDetails = mdxSource.error.stack || JSON.stringify(mdxSource.error, null, 2);
      setPreviewError({ message: errorMsg, details: errorDetails });
      console.error("MDX compilation error:", mdxSource.error);
      return;
    }

    // 编译成功，打开预览弹窗
    const key = insertModal.add(
      <ArticlePreviewModal
        isOpen={true}
        onClose={() => insertModal.close(key)}
        article={values}
        mdxSource={mdxSource}
      />
    );

    // 预览成功后清除错误提示
    setPreviewError(null);
  };

  // 打开封面生成弹窗
  const handleOpenCoverModal = () => {
    setIsCoverModalOpen(true);
  };

  // 获取最新概述
  const getLatestExcerpt = () => {
    return values.excerpt;
  };

  // 确认选择封面
  const handleCoverConfirm = (imageUrl: string) => {
    setFieldValue("coverImageUrl", imageUrl);
    setIsCoverModalOpen(false);
    message.success("封面已更新");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Action Bar */}
      <ActionBar
        status={values.status}
        isSaving={isSaving}
        isGenerating={isAIGenerating}
        onPublish={() => handleSave("published")}
        onImport={handleImport}
        onPreview={handlePreview}
        onGenerate={handleAIGenerate}
        onGenerateCover={handleOpenCoverModal}
      />

      <div className="flex h-[calc(100vh-5rem)] gap-4 px-4 py-3">
        {/* 左侧编辑区域 */}
        <div className="flex flex-1 flex-col space-y-3 overflow-hidden">
          {/* 标题输入 - 固定高度 */}
          <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <input
              type="text"
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              className={`w-full border-none bg-transparent text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500 ${
                errors.title ? "text-red-700 dark:text-red-300" : ""
              }`}
              placeholder="输入文章标题..."
            />
            {errors.title && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </div>
            )}
          </div>

          {/* 摘要输入 - 固定高度 */}
          <div className="flex-shrink-0 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <textarea
              id="excerpt"
              name="excerpt"
              rows={4}
              value={values.excerpt}
              onChange={handleChange}
              className="w-full resize-none border-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-300 dark:placeholder:text-gray-500"
              placeholder="文章摘要（可选）..."
            />
          </div>

          {/* 预览错误横幅 */}
          {previewError && (
            <PreviewErrorBanner
              error={previewError.message}
              details={previewError.details}
              onDismiss={() => setPreviewError(null)}
            />
          )}

          {/* 内容编辑器 - 可滚动区域 */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex flex-shrink-0 items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">正文内容</label>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {values.content.length} 字 · 约 {calculateReadingTime(values.content)} 分钟阅读
                </span>
                <div className="flex items-center gap-2">
                  <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">⌘S</kbd>
                  <span>保存</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <textarea
                ref={contentTextareaRef}
                id="content"
                name="content"
                value={values.content}
                onChange={handleChange}
                className={`font-mono h-full w-full resize-none border-none bg-transparent px-2 py-2 text-sm leading-relaxed text-gray-800 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400/40 placeholder:text-gray-400 hover:scrollbar-thumb-gray-400/60 focus:outline-none dark:text-gray-200 dark:scrollbar-thumb-gray-500/40 dark:placeholder:text-gray-500 dark:hover:scrollbar-thumb-gray-500/60 ${
                  errors.content ? "text-red-700 dark:text-red-300" : ""
                }`}
                placeholder="开始撰写您的文章..."
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
                }}
              />
            </div>
            {errors.content && (
              <div className="mt-2 flex flex-shrink-0 items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.content}
              </div>
            )}
          </div>
        </div>

        {/* 右侧设置栏 */}
        <div className="no-scrollbar w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          {/* 分类选择 */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
            <CategorySelector
              value={values.category}
              onChange={(category) => setFieldValue("category", category)}
              placeholder="选择分类"
              required
            />
            {errors.category && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                {errors.category}
              </div>
            )}
          </div>

          {/* 标签管理 */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">标签</label>
            <TagSelector
              value={values.tags}
              onChange={(tags) => setFieldValue("tags", tags)}
              placeholder="搜索或添加标签..."
            />
          </div>

          {/* URL Slug */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">URL Slug</label>
            <input
              type="text"
              name="slug"
              value={values.slug}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.slug
                  ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                  : "border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              }`}
              placeholder="url-slug"
            />
            {errors.slug && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                {errors.slug}
              </div>
            )}
          </div>

          {/* 封面图片 */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">封面图片</label>
            <input
              type="url"
              name="coverImageUrl"
              value={values.coverImageUrl}
              onChange={handleChange}
              className="mb-3 w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="https://example.com/image.jpg"
            />
            <ImagePreview imageUrl={values.coverImageUrl} alt={values.title || "文章封面"} />
          </div>
        </div>
      </div>

      {/* AI Generate Cover Modal */}
      <AIGenerateCoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        defaultPrompt={values.excerpt}
        onRefreshPrompt={getLatestExcerpt}
        onConfirm={handleCoverConfirm}
      />
    </>
  );
}
