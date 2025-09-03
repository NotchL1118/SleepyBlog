import { ServerActionResponse } from "@/types/server-actions-response";

/**
 * Server Action 工具类
 * 提供统一的错误处理和响应格式
 */
export default class ServerActionBuilder {
  /**
   * 创建成功响应
   */
  static success<T = unknown>(data: T, message?: string): ServerActionResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * 创建错误响应
   */
  static error(error: string | Error, message?: string): ServerActionResponse<never> {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      success: false,
      error: errorMessage,
      message: message || errorMessage,
    };
  }

  /**
   * 安全执行 Server Action
   * 自动捕获错误并返回格式化的响应
   */
  static async execute<T = unknown>(
    fn: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onError?: (error: Error) => void;
    }
  ): Promise<ServerActionResponse<T>> {
    try {
      const result = await fn();
      return ServerActionBuilder.success(result, options?.successMessage);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // 执行错误回调
      if (options?.onError) {
        options.onError(err);
      }

      // 在开发环境打印错误
      if (process.env.NODE_ENV === "development") {
        console.error("Server Action Error:", err);
      }

      return ServerActionBuilder.error(err, options?.errorMessage);
    }
  }

  /**
   * 批量执行 Server Actions
   * 并行执行多个操作并收集结果
   */
  static async executeAll<T extends Record<string, () => Promise<unknown>>>(
    actions: T
  ): Promise<{
    [K in keyof T]: ServerActionResponse<Awaited<ReturnType<T[K]>>>;
  }> {
    const entries = Object.entries(actions);
    const results = await Promise.all(
      entries.map(async ([key, action]) => {
        const result = await ServerActionBuilder.execute(action);
        return [key, result];
      })
    );

    return Object.fromEntries(results) as {
      [K in keyof T]: ServerActionResponse<Awaited<ReturnType<T[K]>>>;
    };
  }

  /**
   * 带验证的执行
   * 在执行前进行数据验证
   */
  static async executeWithValidation<T = unknown, V = unknown>(
    validator: (input: V) => boolean | string,
    input: V,
    fn: (validatedInput: V) => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<ServerActionResponse<T>> {
    // 验证输入
    const validation = validator(input);
    if (validation !== true) {
      const errorMessage = typeof validation === "string" ? validation : "验证失败";
      return ServerActionBuilder.error(errorMessage, options?.errorMessage);
    }

    // 执行操作
    return ServerActionBuilder.execute(() => fn(input), options);
  }

  /**
   * 类型守卫函数，用于检查响应是否成功
   */
  static isSuccess<T>(
    response: ServerActionResponse<T>
  ): response is Extract<ServerActionResponse<T>, { success: true }> {
    return response.success;
  }

  /**
   * 类型守卫函数，用于检查响应是否失败
   */
  static isError<T>(
    response: ServerActionResponse<T>
  ): response is Extract<ServerActionResponse<T>, { success: false }> {
    return !response.success;
  }
}
