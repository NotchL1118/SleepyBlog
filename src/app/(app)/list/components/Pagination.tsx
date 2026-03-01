"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Pagination = ({ currentPage, totalPages, hasNext, hasPrev }: PaginationProps) => {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `/list${queryString ? `?${queryString}` : ""}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showPages = 5; // Show at most 5 page numbers
    const halfShow = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, currentPage + halfShow);

    // Adjust if we're near the beginning or end
    if (currentPage <= halfShow) {
      end = Math.min(totalPages, showPages);
    }
    if (currentPage > totalPages - halfShow) {
      start = Math.max(1, totalPages - showPages + 1);
    }

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis");
      }
    }

    // Add page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      {/* Previous Button */}
      {hasPrev ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          上一页
        </Link>
      ) : (
        <span className="flex cursor-not-allowed items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          上一页
        </span>
      )}

      {/* Page Numbers */}
      <div className="hidden items-center gap-1 sm:flex">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-500">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Mobile Page Indicator */}
      <span className="px-4 text-sm text-gray-500 dark:text-gray-400 sm:hidden">
        {currentPage} / {totalPages}
      </span>

      {/* Next Button */}
      {hasNext ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          下一页
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="flex cursor-not-allowed items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500">
          下一页
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
};

export default Pagination;
