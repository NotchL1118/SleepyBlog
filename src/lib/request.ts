/**
 * 极简的网络请求工具
 * 主要使用 Server Actions，这里只保留最基础的 fetch 封装
 */

/**
 * 简单的 fetch 封装
 * 仅用于特殊场景（如第三方 API、Webhook 等）
 * 大部分情况请使用 Server Actions
 */
export async function simpleFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST 请求的便捷方法
 */
export async function simplePost<T>(url: string, data?: unknown): Promise<T> {
  return simpleFetch<T>(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// 导出简化的 API
export const api = {
  fetch: simpleFetch,
  post: simplePost,
};
