/**
 * 统一的API响应格式类型定义
 */

// 统一的API响应结构
export interface ApiResponse<T = unknown> {
  success: boolean;
  resultCode: number;
  resultMessage: string;
  data: T;
  timestamp: string;
}

// 成功响应
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

// 错误响应
export interface ApiErrorResponse extends ApiResponse<null> {
  success: false;
  data: null;
  error?: string;
}

// 分页信息类型
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 带分页的响应数据类型
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

// 常用的结果码枚举
export enum ResultCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

// 常用的结果消息
export const ResultMessage = {
  SUCCESS: "操作成功",
  CREATED: "创建成功",
  BAD_REQUEST: "请求参数错误",
  UNAUTHORIZED: "未授权访问",
  FORBIDDEN: "禁止访问",
  NOT_FOUND: "资源不存在",
  INTERNAL_ERROR: "服务器内部错误",
} as const;
