import { ReactNode } from "react";

interface HighlightProps {
  children: ReactNode;
  color?: "yellow" | "blue" | "green" | "red" | "purple" | "gray";
  variant?: "background" | "underline" | "border";
}

export default function Highlight({ children, color = "yellow", variant = "background" }: HighlightProps) {
  const colorStyles = {
    yellow: {
      background: "bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100",
      underline: "border-b-2 border-yellow-400 dark:border-yellow-500",
      border: "border border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
    },
    blue: {
      background: "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100",
      underline: "border-b-2 border-blue-400 dark:border-blue-500",
      border: "border border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950",
    },
    green: {
      background: "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100",
      underline: "border-b-2 border-green-400 dark:border-green-500",
      border: "border border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-950",
    },
    red: {
      background: "bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100",
      underline: "border-b-2 border-red-400 dark:border-red-500",
      border: "border border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950",
    },
    purple: {
      background: "bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100",
      underline: "border-b-2 border-purple-400 dark:border-purple-500",
      border: "border border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-950",
    },
    gray: {
      background: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
      underline: "border-b-2 border-gray-400 dark:border-gray-500",
      border: "border border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800",
    },
  };

  const baseStyles = variant === "border" ? "px-2 py-1 rounded" : "px-1 rounded";

  return <span className={`${baseStyles} ${colorStyles[color][variant]}`}>{children}</span>;
}
