"use client";

import { createTag, getTagsForEditor } from "@/actions/tag";
import type { ITag } from "@/types/tag";
import { message } from "@/utils/message-info";
import { Check, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TagSelectorProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * 标签选择器组件
 *
 * 独立实现的标签多选组件，支持搜索和内联快速创建标签
 */
function TagSelector({
  value,
  defaultValue,
  onChange,
  placeholder = "搜索或添加标签...",
  disabled = false,
}: TagSelectorProps) {
  // 标签列表数据
  const [tags, setTags] = useState<ITag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 下拉框状态
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState("");

  // 创建状态
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // 受控/非受控值管理
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const currentValue = isControlled ? value : internalValue;

  // 值变更处理
  const handleValueChange = useCallback(
    (newValue: string[]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  // 标签切换
  const toggleTag = useCallback(
    (tagName: string) => {
      if (currentValue.includes(tagName)) {
        handleValueChange(currentValue.filter((v) => v !== tagName));
      } else {
        handleValueChange([...currentValue, tagName]);
      }
    },
    [currentValue, handleValueChange]
  );

  // 移除标签
  const removeTag = useCallback(
    (tagName: string) => {
      handleValueChange(currentValue.filter((v) => v !== tagName));
    },
    [currentValue, handleValueChange]
  );

  // 获取标签列表
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const result = await getTagsForEditor();
        if (result.success && result.data) {
          setTags(result.data);
        }
      } catch (error) {
        console.error("获取标签列表失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // 搜索过滤
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(query) || tag.slug.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  // 是否可以创建新标签
  const canCreate = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase().trim();
    return !tags.some((tag) => tag.name.toLowerCase() === query);
  }, [tags, searchQuery]);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setNewSlug("");
        setSlugError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 打开时自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 验证 slug
  const validateSlug = (slug: string): boolean => {
    if (!slug.trim()) {
      setSlugError("请输入 slug");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError("仅支持小写字母、数字和连字符");
      return false;
    }
    setSlugError("");
    return true;
  };

  // 创建标签
  const handleCreate = async () => {
    if (!searchQuery.trim() || !validateSlug(newSlug)) return;

    setIsCreating(true);
    try {
      const result = await createTag({ name: searchQuery.trim(), slug: newSlug.trim() });
      if (result.success && result.data) {
        setTags((prev) => [...prev, result.data!]);
        handleValueChange([...currentValue, result.data.name]);
        setSearchQuery("");
        setNewSlug("");
        setSlugError("");
        message.success("标签创建成功");
      } else {
        message.error(result.message || "创建标签失败");
      }
    } catch {
      message.error("创建标签失败");
    } finally {
      setIsCreating(false);
    }
  };

  // 输入框点击
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  // 创建表单键盘事件
  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  };

  const isEmpty = filteredTags.length === 0;
  const hasSearchQuery = Boolean(searchQuery.trim());

  return (
    <div ref={containerRef} className="relative">
      {/* 输入框区域 */}
      <div
        onClick={handleInputClick}
        className={`relative rounded-xl border-2 transition-all duration-200 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-text"} ${
          isOpen
            ? "border-indigo-500 bg-indigo-50/30 dark:border-indigo-400 dark:bg-indigo-950/30"
            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
        } `}
      >
        {/* 已选标签 pills */}
        {currentValue.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
            {currentValue.map((tagName) => (
              <span
                key={tagName}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 py-0.5 pl-2 pr-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {tagName}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tagName);
                  }}
                  className="ml-0.5 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 搜索输入框 */}
        <div className="flex items-center px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={currentValue.length === 0 ? placeholder : "继续添加..."}
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <ChevronDown
            className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* 列表内容 */}
          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              // 加载状态
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : isEmpty && !canCreate ? (
              // 空状态
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {hasSearchQuery ? "没有匹配的标签" : "暂无标签"}
              </div>
            ) : (
              // 标签列表
              <div className="space-y-1">
                {filteredTags.map((tag) => {
                  const isSelected = currentValue.includes(tag.name);
                  return (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                      } `}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded ${isSelected ? "bg-indigo-500 text-white" : "border border-gray-300 dark:border-gray-500"} `}
                        >
                          {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span>{tag.name}</span>
                      </span>
                      {tag.articleCount > 0 && <span className="text-xs text-gray-400">{tag.articleCount}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 底部统计 */}
          {!isLoading && !isEmpty && (
            <div className="border-t border-gray-100 px-3 py-2 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {hasSearchQuery ? `${filteredTags.length} / ${tags.length} 项` : `共 ${tags.length} 项`}
              </span>
            </div>
          )}

          {/* 内联创建 */}
          {canCreate && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <Plus className="h-3.5 w-3.5" />
                <span>
                  新建 <span className="font-medium text-gray-900 dark:text-gray-100">{searchQuery.trim()}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => {
                    setNewSlug(e.target.value);
                    if (slugError) setSlugError("");
                  }}
                  onKeyDown={handleCreateKeyDown}
                  placeholder="slug"
                  className={`flex-1 rounded-lg border bg-white px-3 py-1.5 text-sm outline-none transition-colors dark:bg-gray-700 dark:text-gray-100 ${
                    slugError
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-200 focus:border-indigo-400 dark:border-gray-600 dark:focus:border-indigo-500"
                  } `}
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating || !newSlug.trim()}
                  className="shrink-0 rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "创建"}
                </button>
              </div>
              <p className={`mt-1.5 text-xs ${slugError ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
                {slugError || "小写字母、数字、连字符"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(TagSelector);
