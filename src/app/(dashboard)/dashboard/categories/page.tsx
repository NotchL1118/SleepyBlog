"use client";

import {
  bulkDeleteCategories,
  createCategory,
  deleteCategory,
  getAllCategories,
  syncArticleCount,
  updateCategory,
} from "@/actions/category";
import GlowCard from "@/components/GlowCard";
import type { CategoryCreateData, CategoryFormData, ICategory } from "@/types/category";
import { message } from "@/utils/message-info";
import { AlertCircle, Edit, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "../../_components/auth/AuthProvider";
import DashboardLayout from "../../_components/layout/DashboardLayout";

interface FormErrors {
  [key: string]: string | undefined;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAllCategories({ sortBy: "displayOrder", sortOrder: "asc" });
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        message.error(result.message || "获取分类列表失败");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("获取分类列表失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 生成 slug
  const generateSlug = useCallback(() => {
    const base = formData.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = base || `category-${Date.now()}`;
    setFormData((prev) => ({ ...prev, slug }));
  }, [formData.name]);

  // 自动生成 slug（新建时）
  useEffect(() => {
    if (!isEditing && formData.name.trim() && !formData.slug.trim()) {
      generateSlug();
    }
  }, [formData.name, formData.slug, isEditing, generateSlug]);

  // 处理表单输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      displayOrder: 0,
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  // 打开新建表单
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  // 打开编辑表单
  const handleEdit = (category: ICategory) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
    });
    setIsEditing(true);
    setEditingId(category._id);
    setShowForm(true);
    setErrors({});
  };

  // 保存分类
  const handleSave = async () => {
    // 表单验证
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入分类名称";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "请输入URL slug";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "URL slug只能包含小写字母、数字和连字符";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (isEditing && editingId) {
        const result = await updateCategory(editingId, formData);
        if (result.success) {
          message.success(result.message || "更新成功");
          fetchCategories();
          resetForm();
        } else {
          message.error(result.message || "更新失败");
        }
      } else {
        const result = await createCategory(formData as CategoryCreateData);
        if (result.success) {
          message.success(result.message || "创建成功");
          fetchCategories();
          resetForm();
        } else {
          message.error(result.message || "创建失败");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error("保存失败");
    }
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个分类吗？")) return;

    try {
      const result = await deleteCategory(id);
      if (result.success) {
        message.success(result.message || "删除成功");
        fetchCategories();
      } else {
        message.error(result.message || "删除失败");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("删除失败");
    }
  };

  // 批量删除
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个分类吗？`)) return;

    try {
      const result = await bulkDeleteCategories(selectedIds);
      if (result.success) {
        message.success(result.message || "删除成功");
        setSelectedIds([]);
        fetchCategories();
      } else {
        message.error(result.message || "删除失败");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      message.error("批量删除失败");
    }
  };

  // 同步文章数量
  const handleSyncCount = async () => {
    try {
      setIsSyncing(true);
      const result = await syncArticleCount();
      if (result.success) {
        message.success(result.message || "同步成功");
        fetchCategories();
      } else {
        message.error(result.message || "同步失败");
      }
    } catch (error) {
      console.error("Sync error:", error);
      message.error("同步失败");
    } finally {
      setIsSyncing(false);
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCategories.map((cat) => cat._id));
    } else {
      setSelectedIds([]);
    }
  };

  // 切换选择
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // 过滤分类
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <RequireAuth>
        <DashboardLayout>
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-400"></div>
              <span className="text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">分类管理</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">管理文章分类</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSyncCount}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            同步数量
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            新建分类
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <GlowCard>
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors focus-within:text-indigo-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索分类名称或 slug..."
              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
            />
          </div>
        </div>
      </GlowCard>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 shadow-sm dark:border-indigo-800 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              已选择 {selectedIds.length} 个分类
            </span>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md"
            >
              <Trash2 className="mr-2 inline h-4 w-4" />
              批量删除
            </button>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      <GlowCard>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  名称
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Slug
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  文章数
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  排序
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery ? "没有找到匹配的分类" : "暂无分类，点击上方按钮创建"}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(category._id)}
                        onChange={() => handleToggleSelect(category._id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.articleCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category.displayOrder}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="rounded-lg p-2 text-indigo-600 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category._id)}
                          className="rounded-lg p-2 text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>

      {/* 编辑/新建表单 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <GlowCard>
            <div className="w-full max-w-2xl">
              <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {isEditing ? "编辑分类" : "新建分类"}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4 p-6">
                {/* 分类名称 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">分类名称 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.name
                        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                        : "border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                    placeholder="技术"
                  />
                  {errors.name && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* URL Slug */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">URL Slug *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.slug
                          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                      placeholder="technology"
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="rounded bg-indigo-500 px-3 py-2 text-sm text-white transition-colors hover:bg-indigo-600"
                    >
                      生成
                    </button>
                  </div>
                  {errors.slug && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {errors.slug}
                    </div>
                  )}
                </div>

                {/* 显示顺序 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">显示顺序</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  {isEditing ? "保存" : "创建"}
                </button>
              </div>
            </div>
          </GlowCard>
        </div>
      )}
    </div>
  );
}
