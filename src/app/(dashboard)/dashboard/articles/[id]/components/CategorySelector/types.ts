import type { ICategory } from "@/types/category";

/**
 * CategorySelector 组件的 Props
 */
export interface CategorySelectorProps {
  // 受控模式
  value?: string;
  onChange?: (category: string) => void;

  // 非受控模式
  defaultValue?: string;

  // 通用配置
  placeholder?: string;
  required?: boolean;
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * 受控/非受控值管理的返回类型
 */
export interface UseControlledValueReturn {
  value: string;
  setValue: (newValue: string) => void;
}

/**
 * 分类数据管理的返回类型
 */
export interface UseCategoryDataReturn {
  categories: ICategory[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * 分类搜索的返回类型
 */
export interface UseCategorySearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCategories: ICategory[];
  hasSearchQuery: boolean;
  clearSearch: () => void;
}

/**
 * 分类操作的返回类型
 */
export interface UseCategoryActionsReturn {
  createCategory: (name: string, slug: string) => Promise<void>;
  updateCategory: (id: string, name: string, slug: string) => Promise<void>;
  deleteCategory: (category: ICategory) => Promise<void>;
}

/**
 * 下拉框状态管理的返回类型
 */
export interface UseDropdownStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export type { ICategory };
