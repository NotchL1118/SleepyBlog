// Server Actions 响应类型 - 使用联合类型来区分成功和失败状态
export type ServerActionResponse<T = unknown> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      data?: undefined;
      message?: string;
    };

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
