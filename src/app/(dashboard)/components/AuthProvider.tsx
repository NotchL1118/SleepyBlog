"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "../types/dashboard";

interface AuthContextType {
  session: AuthSession;
  login: (username: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({ isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 检查本地存储的认证状态
    const checkAuth = () => {
      try {
        const storedAuth = sessionStorage.getItem("dashboard_auth");
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          if (authData.isAuthenticated) {
            setSession(authData);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        sessionStorage.removeItem("dashboard_auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (username: string) => {
    const authData: AuthSession = {
      isAuthenticated: true,
      username,
      loginTime: new Date().toISOString(),
    };
    
    setSession(authData);
    sessionStorage.setItem("dashboard_auth", JSON.stringify(authData));
  };

  const logout = () => {
    setSession({ isAuthenticated: false });
    sessionStorage.removeItem("dashboard_auth");
    // 使用window.location进行完全重定向，避免React Router状态冲突
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// 路由保护组件
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 只有在加载完成且确实未认证的情况下才重定向
    if (!isLoading && !session.isAuthenticated) {
      // 使用replace避免历史记录问题
      router.replace("/login");
    }
  }, [session.isAuthenticated, isLoading, router]);

  // 在加载期间显示加载界面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 未认证时不渲染任何内容，等待重定向
  if (!session.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}