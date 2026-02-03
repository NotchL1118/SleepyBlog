"use client";

import { CloseIcon, GitHubIcon, GoogleIcon, LoadingSpinner } from "@/components/Icons";
import { signIn } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<"github" | "google" | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      setError("");
      setIsLoading(null);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSignIn = async (provider: "github" | "google") => {
    setError("");
    setIsLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (e) {
      console.error("Sign in error:", e);
      setError("登录失败，请检查 OAuth 配置是否正确");
      setIsLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full z-[1001] mt-2 w-80 origin-top-right rounded-2xl bg-white p-6 shadow-lg dark:bg-[#1a1a1a]"
        >
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">登录</h2>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleSignIn("github")}
              disabled={isLoading !== null}
              aria-label="使用 GitHub 登录"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24292e] p-0 text-white transition-colors hover:bg-[#1b1f23] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading === "github" ? <LoadingSpinner /> : <GitHubIcon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => handleSignIn("google")}
              disabled={isLoading !== null}
              aria-label="使用 Google 登录"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d2d2d] p-0 transition-colors hover:bg-[#3a3a3a] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#2a2a2a] dark:hover:bg-[#333333]"
            >
              {isLoading === "google" ? <LoadingSpinner /> : <GoogleIcon className="h-4 w-4" />}
            </button>
          </div>

          {error && <p className="mt-4 text-center text-sm text-[#ef4444] dark:text-[#f87171]">{error}</p>}

          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
