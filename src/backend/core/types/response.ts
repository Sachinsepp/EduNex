export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function successResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message: string, code?: string, details?: Record<string, unknown>): ApiResponse {
  return {
    success: false,
    message,
    error: code ? { code, details } : undefined,
  };
}

export function paginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    success: true,
    message: 'Success',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
