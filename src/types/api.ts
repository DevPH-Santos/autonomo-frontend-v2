export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
};
