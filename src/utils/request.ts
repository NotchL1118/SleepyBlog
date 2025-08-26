import { ApiResponse, ApiSuccessResponse } from "@/types/api";

// 定义基础 URL，可以从环境变量中获取
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// API 请求选项
export interface ApiRequestOptions extends RequestInit {
  revalidate?: number | false; // 缓存时间，false 表示不缓存
}

/**
 * 统一的 API 请求函数，返回完整的 ApiResponse
 */
export async function apiFetch<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiSuccessResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const { revalidate = 60, ...fetchOptions } = options;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: { revalidate },
  };

  const mergedOptions = { ...defaultOptions, ...fetchOptions };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      // 尝试解析错误响应
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage = errorData.resultMessage || errorData.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result: ApiResponse<T> = await response.json();

    if (result.success) {
      return result as ApiSuccessResponse<T>;
    } else {
      throw new Error(result.resultMessage || "API request failed");
    }
  } catch (error) {
    console.error(`API fetch error at ${endpoint}:`, error);
    throw error;
  }
}
