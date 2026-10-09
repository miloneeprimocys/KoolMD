/** Mirrors the backend's `PaginationMeta` (`src/common/pagination/paginated-result.ts`). */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  pagination: PaginationMeta;
}

export type SortOrder = "asc" | "desc";

export type RequestStatus = "idle" | "pending" | "succeeded" | "failed";
