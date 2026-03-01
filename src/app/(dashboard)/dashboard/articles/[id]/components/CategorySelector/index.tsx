"use client";

import { createCategory, deleteCategory, getCategoriesForEditor, updateCategory } from "@/actions/category";
import type { ICategory } from "@/types/category";
import { message } from "@/utils/message-info";
import { AlertTriangle, Check, ChevronDown, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CategorySelectorProps {
  value?: string;
  onChange?: (category: string) => void;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * 分类选择器组件
 *
 * 独立实现的分类选择器，支持搜索、创建、编辑、删除分类
 */
export default function CategorySelector({
  value,
  onChange,
  defaultValue = "",
  placeholder = "选择分类",
  required = false,
  allowClear = false,
  className = "",
  disabled = false,
}: CategorySelectorProps) {
  // 受控/非受控值管理
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  // 核心状态
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  // 删除确认状态
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 值变更处理
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [value, onChange]
  );

  // 选择分类
  const handleSelect = useCallback(
    (categoryName: string) => {
      handleValueChange(categoryName);
      setIsOpen(false);
      setSearchQuery("");
    },
    [handleValueChange]
  );

  // 清除选择
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleValueChange("");
    },
    [handleValueChange]
  );

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCategoriesForEditor();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        message.error(result.message || "获取分类列表失败");
      }
    } catch {
      message.error("获取分类列表失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 打开下拉框时获取数据
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  // 打开时自动聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setDeletingId(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 搜索过滤
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) => cat.name.toLowerCase().includes(query) || (cat.slug && cat.slug.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  // 创建分类
  const handleCreate = useCallback(
    async (name: string, slug: string) => {
      const result = await createCategory({ name, slug });
      if (result.success && result.data) {
        message.success("创建分类成功");
        setCategories((prev) => [...prev, result.data!]);
        handleSelect(result.data.name);
        return result.data;
      }
      message.error(result.message || "创建分类失败");
      throw new Error(result.message);
    },
    [handleSelect]
  );

  // 编辑分类
  const handleEdit = useCallback(
    async (id: string, name: string, slug: string) => {
      const oldCategory = categories.find((c) => c._id === id);
      const result = await updateCategory(id, { name, slug });
      if (result.success) {
        message.success("更新分类成功");
        await fetchCategories();
        // 如果编辑的是当前选中项且 name 变了，更新选中值
        if (oldCategory && currentValue === oldCategory.name && oldCategory.name !== name) {
          handleValueChange(name);
        }
      } else {
        message.error(result.message || "更新分类失败");
        throw new Error(result.message);
      }
    },
    [categories, currentValue, fetchCategories, handleValueChange]
  );

  // 删除分类
  const handleDelete = useCallback(
    async (category: ICategory) => {
      const result = await deleteCategory(category._id);
      if (result.success) {
        message.success("删除分类成功");
        setCategories((prev) => prev.filter((c) => c._id !== category._id));
        // 如果删除的是当前选中项，清空选择
        if (currentValue === category.name) {
          handleValueChange("");
        }
      } else {
        message.error(result.message || "删除分类失败");
        throw new Error(result.message);
      }
      setDeletingId(null);
    },
    [currentValue, handleValueChange]
  );

  // 输入框显示值
  const displayValue = isOpen ? searchQuery : currentValue;
  const displayPlaceholder = isOpen ? (currentValue ? `${currentValue}` : "搜索...") : currentValue ? "" : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 输入框 */}
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`flex items-center rounded-xl border px-4 py-3 transition-all duration-200 ${
          isOpen
            ? "cursor-text border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/30 dark:ring-indigo-400/20"
            : "cursor-pointer border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""} `}
      >
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={displayPlaceholder}
          disabled={disabled}
          required={required}
          className={`w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 ${isOpen ? "cursor-text" : "cursor-pointer"} ${disabled ? "cursor-not-allowed" : ""} dark:placeholder:text-gray-500`}
          readOnly={!isOpen}
        />

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 清除按钮 */}
          {allowClear && currentValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {/* 下拉箭头 */}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* 新增按钮 */}
          <div className="border-b border-gray-200 p-3 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 text-sm font-medium text-indigo-600 transition-all duration-200 hover:border-indigo-500 hover:from-indigo-100 hover:to-purple-100 dark:border-indigo-500 dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-400 dark:hover:from-indigo-950 dark:hover:to-purple-950"
            >
              <Plus className="h-4 w-4" />
              新增分类
            </button>
          </div>

          {/* 列表内容 */}
          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery.trim() ? `未找到匹配 "${searchQuery}" 的分类` : "暂无分类"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCategories.map((category) =>
                  deletingId === category._id ? (
                    // 删除确认 UI
                    <div
                      key={category._id}
                      className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 ring-2 ring-red-200 dark:bg-red-950/30 dark:ring-red-800"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          确认删除 &quot;{category.name}&quot;?
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                        >
                          确认删除
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 分类项
                    <div
                      key={category._id}
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(category.name)}
                        className="flex flex-1 items-center gap-2.5 text-left"
                      >
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                          {currentValue === category.name && (
                            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <span
                          className={`flex-1 ${
                            currentValue === category.name
                              ? "font-medium text-indigo-700 dark:text-indigo-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {category.name}
                        </span>
                        {category.articleCount !== undefined && category.articleCount > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">({category.articleCount})</span>
                        )}
                      </button>

                      {/* 编辑/删除按钮 */}
                      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(category);
                          }}
                          className="rounded p-1.5 text-gray-400 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(category._id);
                          }}
                          className="rounded p-1.5 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* 底部统计 */}
          {!isLoading && categories.length > 0 && (
            <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              共 {categories.length} 个分类
              {searchQuery.trim() && ` · 显示 ${filteredCategories.length} 个结果`}
            </div>
          )}
        </div>
      )}

      {/* 创建对话框 */}
      {showCreateDialog && (
        <CategoryDialog
          title="创建分类"
          onClose={() => setShowCreateDialog(false)}
          onSubmit={async (name, slug) => {
            await handleCreate(name, slug);
            setShowCreateDialog(false);
          }}
        />
      )}

      {/* 编辑对话框 */}
      {editingCategory && (
        <CategoryDialog
          title="编辑分类"
          initialName={editingCategory.name}
          initialSlug={editingCategory.slug || ""}
          onClose={() => setEditingCategory(null)}
          onSubmit={async (name, slug) => {
            await handleEdit(editingCategory._id, name, slug);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

// 分类对话框组件
interface CategoryDialogProps {
  title: string;
  initialName?: string;
  initialSlug?: string;
  onClose: () => void;
  onSubmit: (name: string, slug: string) => Promise<void>;
}

function CategoryDialog({ title, initialName = "", initialSlug = "", onClose, onSubmit }: CategoryDialogProps) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isSubmitting, onClose]);

  const validate = (): boolean => {
    const newErrors: { name?: string; slug?: string } = {};

    if (!name.trim()) {
      newErrors.name = "请输入名称";
    }

    if (!slug.trim()) {
      newErrors.slug = "请输入 slug";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = "Slug 只能包含小写字母、数字和连字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(name.trim(), slug.trim());
    } catch {
      // 错误已在上层处理
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 对话框 */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        {/* 头部 */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          {/* 名称输入 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="输入分类名称"
              className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-colors dark:bg-gray-900 ${
                errors.name
                  ? "border-red-300 focus:border-red-500 dark:border-red-600"
                  : "border-gray-200 focus:border-indigo-500 dark:border-gray-700 dark:focus:border-indigo-400"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Slug 输入 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
              }}
              placeholder="输入 slug（URL 友好的标识符）"
              className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-colors dark:bg-gray-900 ${
                errors.slug
                  ? "border-red-300 focus:border-red-500 dark:border-red-600"
                  : "border-gray-200 focus:border-indigo-500 dark:border-gray-700 dark:focus:border-indigo-400"
              }`}
            />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">小写字母、数字、连字符</p>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialName ? "保存" : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}
