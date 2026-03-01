import type { ICategory } from "@/types/category";
import { memo, useEffect, useRef, useState } from "react";
import { CategoryItem } from "./CategoryItem";
import { EmptyState } from "./EmptyState";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LoadingState } from "./LoadingState";

interface CategoryDropdownProps {
  categories: ICategory[];
  selectedValue: string;
  searchQuery: string;
  isLoading: boolean;
  onSelect: (name: string) => void;
  onCreateNew: () => void;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
  totalCount: number;
}

/**
 * 分类选择器下拉菜单
 */
export const CategoryDropdown = memo(function CategoryDropdown({
  categories,
  selectedValue,
  searchQuery,
  isLoading,
  onSelect,
  onCreateNew,
  onEdit,
  onDelete,
  totalCount,
}: CategoryDropdownProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // 自动滚动到选中项
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, []);

  const handleDelete = (categoryId: string) => {
    setDeletingId(categoryId);
  };

  const handleConfirmDelete = (category: ICategory) => {
    onDelete(category);
    setDeletingId(null);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const hasSearchQuery = Boolean(searchQuery.trim());
  const isEmpty = categories.length === 0;

  return (
    <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <Header onCreateNew={onCreateNew} />

      <div className="max-h-64 overflow-y-auto p-2">
        {isLoading ? (
          <LoadingState />
        ) : isEmpty ? (
          <EmptyState hasSearchQuery={hasSearchQuery} searchQuery={searchQuery} />
        ) : (
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category._id} ref={selectedValue === category.name ? selectedItemRef : null}>
                <CategoryItem
                  category={category}
                  isSelected={selectedValue === category.name}
                  isDeleting={deletingId === category._id}
                  onSelect={() => onSelect(category.name)}
                  onEdit={() => onEdit(category)}
                  onDelete={() => handleDelete(category._id)}
                  onConfirmDelete={() => handleConfirmDelete(category)}
                  onCancelDelete={handleCancelDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLoading && !isEmpty && <Footer totalCount={totalCount} filteredCount={categories.length} hasSearchQuery={hasSearchQuery} />}
    </div>
  );
});
