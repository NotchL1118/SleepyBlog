"use client";
import { useEffect, useState } from "react";
import { TopArrowIcon } from "../Icons";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      className={`fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl dark:from-blue-500 dark:to-purple-500 dark:shadow-purple-500/50 dark:hover:shadow-purple-500/70 ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0"
      }`}
      aria-label="返回顶部"
    >
      <TopArrowIcon />
    </button>
  );
}
