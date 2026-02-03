"use client";

import { signOut, useSession } from "@/lib/auth-client";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  Tags,
  User,
  UserIcon,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardMenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
}

const menuItems: DashboardMenuItem[] = [
  {
    key: "dashboard",
    label: "仪表板",
    icon: "LayoutDashboard",
    path: "/dashboard",
  },
  {
    key: "articles",
    label: "文章管理",
    icon: "FileText",
    path: "/dashboard/articles",
  },
  {
    key: "categories",
    label: "分类管理",
    icon: "Tags",
    path: "/dashboard/categories",
  },
  {
    key: "analytics",
    label: "数据统计",
    icon: "BarChart3",
    path: "/dashboard/analytics",
  },
  {
    key: "settings",
    label: "网站设置",
    icon: "Settings",
    path: "/dashboard/settings",
  },
];

const iconMap = {
  LayoutDashboard,
  FileText,
  Tags,
  Settings,
  BarChart3,
};

// 主题切换组件
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  const themes = [
    { key: "light", icon: Sun, label: "浅色模式" },
    { key: "dark", icon: Moon, label: "深色模式" },
    { key: "system", icon: Monitor, label: "跟随系统" },
  ];

  const currentTheme = themes.find((t) => t.key === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <button
      onClick={() => {
        const currentIndex = themes.findIndex((t) => t.key === theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex].key);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
      title={`当前: ${currentTheme.label}`}
    >
      <CurrentIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    </button>
  );
}

// 移动端菜单
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-64 transform border-l border-gray-200 bg-white shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">菜单</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回主站
            </Link>

            {menuItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.key}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center space-x-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                  {session?.user?.name || "管理员"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  description,
  actions,
  fullWidth = false,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || "管理员";
  const userImage = session?.user?.image || "";

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/90">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="hidden text-sm font-bold text-gray-800 sm:inline dark:text-gray-100">后台管理</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-1 md:flex">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="hidden items-center space-x-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:flex dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>返回主站</span>
            </Link>

            <ThemeToggle />

            {/* Desktop User Menu */}
            <div className="hidden items-center space-x-2 rounded-lg bg-gray-100 px-3 py-1.5 lg:flex dark:bg-gray-800">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={session?.user?.name || ""}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{userName}</span>
            </div>

            <button
              onClick={() => {
                signOut();
              }}
              className="hidden items-center space-x-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700 lg:flex dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page Title Bar (if provided) */}
        {(title || actions) && (
          <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <div className={fullWidth ? "mx-auto" : "mx-auto max-w-7xl"}>
              <div className="flex items-center justify-between">
                <div>
                  {title && <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>}
                  {description && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
                </div>
                {actions && <div className="flex items-center space-x-3">{actions}</div>}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className={fullWidth ? "h-full" : "mx-auto max-w-7xl p-1"}>{children}</div>
      </main>
    </div>
  );
}
