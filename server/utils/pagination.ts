export class PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
    this.isFirst = page === 0;
    this.isLast = page >= this.totalPages - 1;
  }
}
