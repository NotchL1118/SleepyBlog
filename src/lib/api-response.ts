import { ApiErrorResponse, ApiResponse, PaginatedData, ResultCode, ResultMessage } from "@/types/api";
import { NextResponse } from "next/server";

/**
 * API 响应构建器类
 * 提供链式调用的方式构建API响应
 */
export class ApiResponseBuilder {
  /**
   * 创建成功响应
   */
  static success<T>(data?: T) {
    return new SuccessResponseBuilder<T>(data);
  }

  /**
   * 创建错误响应
   */
  static error(message: string, code: number = ResultCode.INTERNAL_ERROR) {
    return new ErrorResponseBuilder(message, code);
  }

  /**
   * 创建分页响应
   */
  static paginated<T>(items: T[], pagination: PaginatedData<T>["pagination"]) {
    return new SuccessResponseBuilder<PaginatedData<T>>({ items, pagination });
  }
}

/**
 * 成功响应构建器
 */
class SuccessResponseBuilder<T> {
  private data?: T;
  private message: string = ResultMessage.SUCCESS;
  private code: number = ResultCode.SUCCESS;

  constructor(data?: T) {
    this.data = data;
  }

  /**
   * 设置响应消息
   */
  withMessage(message: string) {
    this.message = message;
    return this;
  }

  /**
   * 设置状态码
   */
  withCode(code: number) {
    this.code = code;
    return this;
  }

  /**
   * 发送响应
   */
  send(): NextResponse<ApiResponse<T>> {
    const status = this.code === ResultCode.SUCCESS ? undefined : this.code;

    return NextResponse.json(
      {
        success: true,
        resultCode: this.code,
        resultMessage: this.message,
        data: this.data as T, // 断言类型，因为成功响应总是有数据
        timestamp: new Date().toISOString(),
      },
      status ? { status } : undefined
    );
  }
}

/**
 * 错误响应构建器
 */
class ErrorResponseBuilder {
  private message: string;
  private code: number;
  private error?: string;

  constructor(message: string, code: number) {
    this.message = message;
    this.code = code;
  }

  /**
   * 设置详细错误信息
   */
  withError(error: string | Error) {
    this.error = error instanceof Error ? error.message : error;
    return this;
  }

  /**
   * 发送响应
   */
  send(): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        resultCode: this.code,
        resultMessage: this.message,
        data: null, // 错误响应的 data 总是 null
        error: this.error,
        timestamp: new Date().toISOString(),
      },
      { status: this.code }
    );
  }
}

// 便捷的静态方法
export const ApiResponder = {
  // 成功响应
  ok: <T>(data?: T, message?: string) =>
    ApiResponseBuilder.success(data)
      .withMessage(message || ResultMessage.SUCCESS)
      .send(),

  // 创建成功响应
  created: <T>(data?: T, message?: string) =>
    ApiResponseBuilder.success(data)
      .withCode(ResultCode.CREATED)
      .withMessage(message || ResultMessage.CREATED)
      .send(),

  // 错误响应
  badRequest: (message?: string, error?: string | Error) =>
    ApiResponseBuilder.error(message || ResultMessage.BAD_REQUEST, ResultCode.BAD_REQUEST)
      .withError(error || "")
      .send(),

  notFound: (message?: string) =>
    ApiResponseBuilder.error(message || ResultMessage.NOT_FOUND, ResultCode.NOT_FOUND).send(),

  serverError: (message?: string, error?: string | Error) =>
    ApiResponseBuilder.error(message || ResultMessage.INTERNAL_ERROR, ResultCode.INTERNAL_ERROR)
      .withError(error || "")
      .send(),

  // 分页响应
  paginated: <T>(items: T[], pagination: PaginatedData<T>["pagination"], message?: string) =>
    ApiResponseBuilder.paginated(items, pagination)
      .withMessage(message || "获取列表成功")
      .send(),
};
