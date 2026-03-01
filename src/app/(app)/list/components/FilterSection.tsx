"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

interface FilterSectionProps {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
}

interface TagButtonProps {
  label: string;
  count?: number;
  isSelected: boolean;
  onClick: () => void;
}

const TagButton = ({ label, count, isSelected, onClick }: TagButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        isSelected
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 ${isSelected ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>({count})</span>
      )}
    </motion.button>
  );
};

const FilterSection = ({ categories, tags }: FilterSectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  // Sync search value with URL params
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`/list?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateParams("search", searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, currentSearch, updateParams]);

  const handleClearFilters = () => {
    setSearchValue("");
    startTransition(() => {
      router.push("/list");
    });
  };

  const handleCategoryClick = (categoryName: string) => {
    // Toggle: if already selected, deselect; otherwise select
    updateParams("category", currentCategory === categoryName ? "" : categoryName);
  };

  const handleTagClick = (tagName: string) => {
    // Toggle: if already selected, deselect; otherwise select
    updateParams("tag", currentTag === tagName ? "" : tagName);
  };

  const hasActiveFilters = currentSearch || currentCategory || currentTag;
  const hasFilterSelections = currentCategory || currentTag;
  const filterCount = (currentCategory ? 1 : 0) + (currentTag ? 1 : 0);

  // Generate filter button text
  const getFilterButtonText = () => {
    if (filterCount === 0) return "筛选";
    if (filterCount === 1) {
      return currentCategory || currentTag;
    }
    return `${filterCount} 个筛选`;
  };

  // Shared input styles
  const baseInputStyles =
    "rounded-xl border bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-all duration-200 dark:bg-gray-800/50";
  const focusStyles =
    "focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] dark:focus:border-blue-400 dark:focus:bg-gray-800 dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]";
  const borderStyles = "border-gray-200/80 dark:border-gray-700/80";

  const hasFiltersAvailable = categories.length > 0 || tags.length > 0;

  return (
    <div className="mb-8 space-y-3">
      {/* Search Input + Filter Button Row */}
      <div className="flex items-center gap-3">
        <motion.div
          className="relative flex-1"
          animate={{ scale: isSearchFocused ? 1.01 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="搜索文章..."
            className={`w-full pl-10 pr-10 ${baseInputStyles} ${borderStyles} ${focusStyles} dark:text-white dark:placeholder-gray-500`}
          />
          <motion.svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{
              color: isSearchFocused ? "rgb(59, 130, 246)" : "rgb(156, 163, 175)",
            }}
            transition={{ duration: 0.2 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </motion.svg>
          <AnimatePresence>
            {isPending && (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filter Button */}
        {hasFiltersAvailable && (
          <motion.button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm transition-all ${
              hasFilterSelections
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400"
                : `${borderStyles} bg-gray-50/50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800`
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{getFilterButtonText()}</span>
            <motion.svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: filterPanelOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>
        )}

        {/* Clear All Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              onClick={handleClearFilters}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              清除筛选
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {filterPanelOpen && hasFiltersAvailable && (
          <motion.div
            className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/80 dark:bg-gray-900"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="p-4 space-y-4">
              {/* Categories Section */}
              {categories.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    分类
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <TagButton
                        key={category.name}
                        label={category.name}
                        count={category.count}
                        isSelected={currentCategory === category.name}
                        onClick={() => handleCategoryClick(category.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {tags.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TagButton
                        key={tag.name}
                        label={tag.name}
                        count={tag.count}
                        isSelected={currentTag === tag.name}
                        onClick={() => handleTagClick(tag.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filter Button inside panel */}
              {hasFilterSelections && (
                <div className="border-t border-gray-200/80 pt-3 dark:border-gray-700/80">
                  <motion.button
                    onClick={() => {
                      if (currentCategory) updateParams("category", "");
                      if (currentTag) updateParams("tag", "");
                    }}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    清除分类和标签筛选
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSection;
