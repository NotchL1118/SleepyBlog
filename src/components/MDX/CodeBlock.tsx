"use client";

import { CheckIcon, ChevronDownIcon, CopyIcon } from "@/components/Icons";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ code, language = "javascript", showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");
  const shouldCollapse = lines.length > 15;

  const bgColor = isDark ? "#1e1e1e" : "#fafafa";
  const baseStyle = isDark ? vscDarkPlus : oneLight;

  const customStyle = {
    ...baseStyle,
    'pre[class*="language-"]': {
      ...baseStyle['pre[class*="language-"]'],
      background: bgColor,
      margin: 0,
      padding: "1rem",
    },
    'code[class*="language-"]': {
      ...baseStyle['code[class*="language-"]'],
      background: bgColor,
    },
  };

  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Language label & Copy button - appears on hover */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="flex h-7 items-center rounded-md bg-gray-200/80 px-2 text-xs text-gray-600 backdrop-blur-sm dark:bg-gray-700/80 dark:text-gray-300">
          {language}
        </span>
        <motion.button
          onClick={copyToClipboard}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-200/80 text-gray-600 backdrop-blur-sm hover:bg-gray-300/80 dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckIcon />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CopyIcon />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code area */}
      <motion.div
        className="overflow-hidden"
        animate={{
          height: isExpanded ? "auto" : shouldCollapse ? "400px" : "auto",
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      >
        <div
          className="overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
          style={{
            maxHeight: isExpanded ? "none" : shouldCollapse ? "400px" : "none",
          }}
        >
          <SyntaxHighlighter
            language={language}
            style={customStyle}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              background: bgColor,
              fontSize: "14px",
              lineHeight: "1.6",
            }}
            lineNumberStyle={{
              color: "#6b7280",
              paddingRight: "1rem",
              userSelect: "none",
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </motion.div>

      {/* Expand button - minimal text button */}
      <AnimatePresence>
        {shouldCollapse && !isExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-gradient-to-t from-white/95 via-white/50 via-[30%] to-transparent py-2 text-sm text-gray-500 backdrop-blur-[2px] transition-colors hover:text-gray-700 dark:from-[#1e1e1e]/95 dark:via-[#1e1e1e]/50 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronDownIcon />
            <span className="text-xs">展开</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
