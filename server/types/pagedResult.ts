export class PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
}
interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface PaginationUserRequest {
  pageSize?: string;
  currentPage?: string;
  sortBy?: string;
  sortOrder?: "ascend" | "descend";
  search?: string;
  providers?: string[];
  statuses?: string[];
}
