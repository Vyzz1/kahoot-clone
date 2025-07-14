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
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};



declare type Quiz = {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
};


