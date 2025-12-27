"use client";

import { validateAdminLogin } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminCredentials {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 检查是否已经登录
    const checkAuth = () => {
      try {
        const session = sessionStorage.getItem("dashboard_auth");
        if (session) {
          const authData = JSON.parse(session);
          if (authData.isAuthenticated) {
            // 已登录，重定向到dashboard
            router.replace("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Invalid session data:", error);
        sessionStorage.removeItem("dashboard_auth");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await validateAdminLogin(credentials.username, credentials.password);

      if (result.success && result.data?.isValid) {
        // 存储登录状态到 sessionStorage
        sessionStorage.setItem(
          "dashboard_auth",
          JSON.stringify({
            isAuthenticated: true,
            username: credentials.username,
            loginTime: new Date().toISOString(),
          })
        );

        // 重定向到dashboard
        router.replace("/dashboard");
      } else {
        setError(result.message || "登录失败");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("登录过程中出现错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 正在检查认证状态时显示加载界面
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">检查登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">后台管理系统</h1>
          <p className="text-gray-600">SleepYoung&apos;s Blog Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入用户名"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入密码"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                登录中...
              </div>
            ) : (
              "登录"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
