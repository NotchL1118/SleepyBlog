import { ReactNode } from "react";

interface BlockquoteProps {
  children: ReactNode;
}

export default function Blockquote({ children }: BlockquoteProps) {
  return (
    <div className="relative my-4 rounded-r-lg border-l-4 border-blue-500 bg-gray-50 p-4 dark:border-l-blue-400 dark:bg-gray-800">
      {/* Quote icon */}
      <svg
        className="mb-2 h-8 w-8 text-blue-400 opacity-40 dark:text-blue-300 dark:opacity-50"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
      </svg>
      {/* Quote content */}
      <div className="italic leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
}
