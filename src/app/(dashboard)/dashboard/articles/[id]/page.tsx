"use client";

import { createArticle, getArticleById, updateArticle } from "@/actions/article";
import { mdxComponents } from "@/mdx-components";
import type { Article } from "@/types/article";
import { AlertCircle, ArrowLeft, Eye, Loader, Plus, Save, Settings, Tag, X } from "lucide-react";
import { MDXComponents } from "mdx/types";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { MDXRemote } from "next-mdx-remote";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "../../../components/AuthProvider";
import DashboardLayout from "../../../components/DashboardLayout";

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  status: "draft" | "published" | "archived";
  slug: string;
  coverImageUrl?: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function ArticleEditorPage() {
  const router = useRouter();
  const params = useParams() as { id?: string } | null;
  const articleId = params?.id;
  const isEditing = Boolean(articleId && articleId !== "new");

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    category: "",
    status: "draft",
    slug: "",
    coverImageUrl: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [previewData, setPreviewData] = useState<MDXRemoteSerializeResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [categories] = useState(["技术", "生活", "思考", "旅行", "读书", "音乐", "电影", "其他"]);

  // 生成slug
  const generateSlug = useCallback(() => {
    const base = formData.title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // 去除音标
      .replace(/[^a-z0-9]+/g, "-") // 仅保留小写字母、数字，用连字符分隔
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = base || `post-${Date.now()}`;
    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.title]);

  // 获取文章数据（编辑模式）
  const fetchArticle = useCallback(async () => {
    if (!isEditing || !articleId) return;

    try {
      setIsLoading(true);
      const result = await getArticleById(articleId);
      if (result.success && result.data) {
        const article = result.data as Article;
        setFormData({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || "",
          tags: article.tags,
          category: article.category,
          status: article.status,
          slug: article.slug,
          coverImageUrl: article.coverImageUrl,
        });
      } else {
        throw new Error(result.message || "文章不存在");
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
      alert("获取文章失败");
      router.push("/dashboard/articles");
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isEditing, router]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // 新建时根据标题自动生成 slug（仅当 slug 为空时）
  useEffect(() => {
    if (!isEditing && formData.title.trim() && !formData.slug.trim()) {
      generateSlug();
    }
  }, [formData.title, formData.slug, isEditing, generateSlug]);

  // 实时预览：编译 MDX 内容（防抖）
  useEffect(() => {
    if (!previewEnabled) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsCompiling(true);
        setCompileError(null);
        const res = await fetch("/api/mdx/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: formData.content }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Compile failed");
        }
        setPreviewData(data.mdx as MDXRemoteSerializeResult);
      } catch (err: Error | unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setCompileError(err?.message || "预览编译失败");
        }
      } finally {
        setIsCompiling(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [formData.content, previewEnabled]);

  // 表单验证
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "请输入文章标题";
    }

    if (!formData.content.trim()) {
      newErrors.content = "请输入文章内容";
    }

    if (!formData.category.trim()) {
      newErrors.category = "请选择文章分类";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "请输入URL slug";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "URL slug只能包含小写字母、数字和连字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 保存文章
  const handleSave = useCallback(
    async (status?: ArticleFormData["status"]) => {
      const saveData = status ? { ...formData, status } : formData;

      if (!validateForm()) return;

      try {
        setIsSaving(true);

        const result =
          isEditing && articleId ? await updateArticle(articleId, saveData) : await createArticle(saveData);

        if (result.success) {
          alert(result.message || "保存成功");
          if (!isEditing && result.data) {
            // 新建文章成功后跳转到编辑页面
            router.push(`/dashboard/articles/${result.data._id}`);
          } else if (result.data) {
            // 更新本地数据
            const article = result.data as Article;
            setFormData({
              title: article.title,
              content: article.content,
              excerpt: article.excerpt || "",
              tags: article.tags,
              category: article.category,
              status: article.status,
              slug: article.slug,
              coverImageUrl: article.coverImageUrl,
            });
          }
        } else {
          alert(result.error || "保存失败");
        }
      } catch (error) {
        console.error("Save error:", error);
        alert("保存失败");
      } finally {
        setIsSaving(false);
      }
    },
    [formData, validateForm, isEditing, articleId, router]
  );

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S 保存草稿
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isSaving) {
          handleSave("draft");
        }
      }
      // Ctrl/Cmd + Enter 发布文章
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSaving) {
          handleSave("published");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaving, handleSave]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 添加标签
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 处理标签输入键盘事件
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <DashboardLayout>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <DashboardLayout
        title={isEditing ? "编辑文章" : "新建文章"}
        description={isEditing ? `编辑文章: ${formData.title}` : "创建新的博客文章"}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center px-3 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">返回</span>
            </button>

            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {isSaving ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              <span className="hidden sm:inline">草稿</span>
              <span className="sm:hidden">存</span>
            </button>

            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : <Eye className="mr-1 h-4 w-4" />}
              <span className="hidden sm:inline">发布</span>
              <span className="sm:hidden">发布</span>
            </button>
          </div>
        }
      >
        <div className="flex h-full min-h-0 pb-24">
          {/* 主编辑区域 - 占据大部分屏幕 */}
          <div className="mr-6 flex min-h-0 flex-1 flex-col">
            {/* 标题区域 */}
            <div className="mb-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">文章标题</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-2 px-3 py-2.5 text-xl font-bold outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500 ${
                      errors.title
                        ? "border-red-300 bg-red-50 text-red-700 focus:border-red-400 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:focus:border-red-500"
                        : "border-gray-200 bg-gray-50 text-gray-900 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-indigo-400 dark:focus:border-indigo-400 dark:focus:bg-gray-900"
                    }`}
                    placeholder="输入您的文章标题..."
                  />
                  {errors.title && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.title}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">文章摘要</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={2}
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="w-full resize-none rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-400 dark:focus:border-indigo-400 dark:focus:bg-gray-900"
                    placeholder="文章摘要（可选）..."
                  />
                </div>
              </div>
            </div>

            {/* 内容编辑器 - 占满剩余空间 */}
            <div className="flex min-h-[80vh] flex-1 flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">正文内容</label>
                  <div className="rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-400 dark:bg-gray-700 dark:text-gray-300">
                    {formData.content.length} 字 • 约 {Math.ceil(formData.content.length / 250)} 分钟阅读
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={() => setPreviewEnabled((v) => !v)}
                    className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                      previewEnabled
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                    title="切换实时预览"
                  >
                    {previewEnabled ? "关闭预览" : "实时预览"}
                  </button>
                  <div className="flex items-center space-x-2">
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-200">
                      ⌘S
                    </kbd>
                    <span>保存</span>
                  </div>
                </div>
              </div>
              <div className={`${previewEnabled ? "grid grid-cols-2 gap-4" : "block"} min-h-0 flex-1`}>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className={`font-mono h-full min-h-[60vh] w-full resize-none rounded-lg border-2 px-4 py-4 text-sm leading-relaxed transition-all duration-200 focus:ring-2 focus:ring-indigo-500 ${
                    errors.content
                      ? "border-red-300 bg-red-50 text-red-700 focus:border-red-400 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:focus:border-red-500"
                      : "border-gray-200 bg-gray-50 text-gray-800 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-indigo-400 dark:focus:border-indigo-400 dark:focus:bg-gray-900"
                  }`}
                  placeholder="开始撰写您的文章... 使用 MDX 语法进行实时预览"
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
                  }}
                />

                {previewEnabled && (
                  <div className="h-full min-h-[60vh] w-full overflow-auto rounded-lg border-2 border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      {isCompiling ? "编译预览中…" : compileError ? `预览出错：${compileError}` : "实时预览"}
                    </div>
                    <div className="prose prose-base max-w-none rounded-lg border border-gray-100 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                      {previewData ? (
                        <MDXRemote {...previewData} components={mdxComponents as unknown as MDXComponents} />
                      ) : (
                        <div className="text-sm text-gray-400">输入内容以查看预览…</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.content && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.content}
                </div>
              )}
            </div>
          </div>

          {/* 侧边设置面板 - 固定宽度 */}
          <div className="w-80 space-y-4 pb-24">
            {/* 快速操作 */}
            <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">发布操作</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSave("published")}
                  disabled={isSaving}
                  className="flex w-full items-center justify-center rounded-lg bg-white/20 px-4 py-3 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 disabled:opacity-50"
                >
                  {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                  发布文章
                </button>

                <button
                  onClick={() => handleSave("draft")}
                  disabled={isSaving}
                  className="flex w-full items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  保存草稿
                </button>
              </div>
            </div>

            {/* 文章设置 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Settings className="mr-2 h-5 w-5 text-indigo-500" />
                文章设置
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">状态</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 font-medium text-gray-800 transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-indigo-400 dark:focus:border-indigo-400 dark:focus:bg-gray-900"
                  >
                    <option value="draft" className="text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                      草稿
                    </option>
                    <option value="published" className="text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                      已发布
                    </option>
                    <option value="archived" className="text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                      已归档
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">分类</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-2 bg-gray-50 px-3 py-2.5 font-medium text-gray-800 transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 ${
                      errors.category
                        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                        : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-indigo-400 dark:focus:border-indigo-400 dark:focus:bg-gray-900"
                    }`}
                  >
                    <option value="" className="text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      选择分类
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.category}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO 设置 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Tag className="mr-2 h-5 w-5 text-green-500" />
                SEO 设置
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">URL Slug</label>
                  <div className="flex overflow-hidden rounded-lg border-2 border-gray-200 transition-all duration-200 focus-within:border-indigo-500 hover:border-indigo-300 dark:border-gray-700 dark:focus-within:border-indigo-400 dark:hover:border-indigo-400">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`flex-1 border-none bg-gray-50 px-3 py-2.5 font-medium text-gray-800 outline-none transition-colors focus:bg-white focus:ring-0 ${
                        errors.slug
                          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                      }`}
                      placeholder="url-slug"
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="bg-indigo-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
                    >
                      生成
                    </button>
                  </div>
                  {errors.slug && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.slug}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">封面图片</label>
                  <input
                    type="url"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-800 transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-indigo-400 dark:focus:border-indigo-400 dark:focus:bg-gray-900"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* 标签管理 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Plus className="mr-2 h-5 w-5 text-blue-500" />
                标签管理
              </h3>

              <div className="space-y-3">
                <div className="flex overflow-hidden rounded-lg border-2 border-gray-200 transition-all duration-200 focus-within:border-indigo-500 hover:border-indigo-300 dark:border-gray-700 dark:focus-within:border-indigo-400 dark:hover:border-indigo-400">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 border-none bg-gray-50 px-3 py-2.5 font-medium text-gray-800 outline-none transition-colors focus:bg-white focus:ring-0 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                    placeholder="添加标签"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-blue-500 px-3 py-2.5 text-white transition-colors hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 text-xs font-medium text-blue-800 dark:border-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300"
                    >
                      <span className="font-semibold">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 transition-colors hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
