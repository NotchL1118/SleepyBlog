"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "./AuthProvider";

interface ConditionalAuthProviderProps {
  children: React.ReactNode;
}

export default function ConditionalAuthProvider({ children }: ConditionalAuthProviderProps) {
  const pathname = usePathname();

  // 登录页面不需要AuthProvider，避免循环重定向
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 其他页面使用AuthProvider
  return <AuthProvider>{children}</AuthProvider>;
}
