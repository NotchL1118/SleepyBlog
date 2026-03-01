"use client";

import { DashboardIcon, LogoutIcon, UserIcon } from "@/components/Icons";
import { getLastUsedLoginMethod, signOut, useSession } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AvatarWithBadge from "./AvatarWithBadge";
import LoginModal from "./LoginModal";

// ============================================================================
// UserDropdown 组件
// ============================================================================

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  lastLoginMethod: string | null;
}

function UserDropdown({ isOpen, onClose, lastLoginMethod }: UserDropdownProps) {
  const { data: session } = useSession();

  if (!session) return null;

  const isAdmin = session.session.isAdmin;

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          onClose();
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {/* 用户信息卡片 */}
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <AvatarWithBadge
                image={session.user.image}
                name={session.user.name}
                email={session.user.email}
                loginMethod={lastLoginMethod}
                size="md"
              />

              {/* 用户信息 */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">{session.user.name || "用户"}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* 菜单选项 */}
          <div className="p-2">
            {isAdmin && (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <DashboardIcon className="h-4 w-4" />
                管理后台
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogoutIcon className="h-4 w-4" />
              退出登录
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// UserMenu 主组件
// ============================================================================

export default function UserMenu() {
  const { data: session, isPending } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session;

  const lastLoginMethod = getLastUsedLoginMethod();

  // 点击外部关闭下拉菜单和登录模态框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsLoginModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 加载状态
  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />;
  }

  // 未登录状态：显示登录按钮
  if (!isLoggedIn) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          aria-label="登录"
        >
          <UserIcon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
        </button>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  // 已登录状态：显示用户头像和下拉菜单
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 rounded-lg p-1"
        aria-label="用户菜单"
      >
        <AvatarWithBadge
          image={session.user.image}
          name={session.user.name}
          email={session.user.email}
          loginMethod={lastLoginMethod}
          size="sm"
        />
      </button>

      <UserDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        lastLoginMethod={lastLoginMethod}
      />
    </div>
  );
}
