declare type CurrentUserType = {
  photoUrl: string;
  name: string;
  id: number;
  role: string;
  email: string;
};

declare type User = {
  _id: number;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isBanned: boolean;
  provider: string;
  providerId: string;
};

declare type Pagination<T> = {
  content: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  isPrevious: boolean;
  isNext: boolean;
};
