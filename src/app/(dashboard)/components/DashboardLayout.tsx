"use client";

import { useAuth } from "./AuthProvider";
import type { DashboardMenuItem } from "../types/dashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Sun,
  Moon,
  Monitor,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

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
    return <div className="w-9 h-9" />;
  }

  const themes = [
    { key: "light", icon: Sun, label: "浅色模式" },
    { key: "dark", icon: Moon, label: "深色模式" },
    { key: "system", icon: Monitor, label: "跟随系统" },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.key === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].key);
        }}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title={`当前: ${currentTheme.label}`}
      >
        <CurrentIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, session } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl 
        border-r border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-2xl 
        transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    后台管理
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SleepYoung&apos;s Blog
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {/* Return to main site button */}
            <Link
              href="/"
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                group relative overflow-hidden mb-3 border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20
                hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <ArrowLeft className="mr-3 h-4 w-4 group-hover:scale-105 transition-transform duration-200" />
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
                  className={`
                    flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  {item.label}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white/30 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle and User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">主题</span>
              <ThemeToggle />
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {session.username || "管理员"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.loginTime ? new Date(session.loginTime).toLocaleDateString() : ""}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:scale-105 transition-transform duration-200" />
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
}

export default function DashboardLayout({ 
  children, 
  title,
  description,
  actions 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
          {/* Top bar - Fixed */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-30 shadow-sm">
            <div className="flex items-center justify-between px-4 py-4 lg:px-6">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div className="lg:ml-0 ml-3">
                  {title && (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                  )}
                </div>
              </div>
              
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </header>

          {/* Page content - Takes remaining height */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}