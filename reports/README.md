# BÁO CÁO MODULE QUẢN LÝ NGƯỜI DÙNG - KAHOOT CLONE

# 1. TỔNG QUAN HỆ THỐNG

Module quản lý người dùng là một phần quan trọng của hệ thống Kahoot Clone, được xây dựng với kiến trúc fullstack sử dụng:

- **Backend**: Node.js, Express.js, TypeScript, MongoDB với Mongoose
- **Frontend**: React.js, TypeScript, Ant Design, Vite
- **Authentication**: JWT (Access Token + Refresh Token)
- **State Management**: React Context API

# 2. THIẾT KẾ CƠ SỞ DỮ LIỆU

## 2.1 User Schema (MongoDB)

```typescript
// server/models/user.model.ts
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
```

## 2.2 Thuộc tính chi tiết

| Trường     | Kiểu dữ liệu | Mô tả                     | Ràng buộc                   |
| ---------- | ------------ | ------------------------- | --------------------------- |
| fullName   | String       | Tên đầy đủ của người dùng | Required, trim              |
| role       | String       | Vai trò (user/admin)      | Required, default: "user"   |
| email      | String       | Email đăng nhập           | Required, unique, lowercase |
| avatar     | String       | URL ảnh đại diện          | Optional                    |
| provider   | String       | Nhà cung cấp xác thực     | Required                    |
| providerId | String       | ID từ provider            | Required                    |
| password   | String       | Mật khẩu mã hóa           | Select: false               |
| isBanned   | Boolean      | Trạng thái bị cấm         | Default: false              |
| lastLogin  | Date         | Lần đăng nhập cuối        | Default: null               |
| createdAt  | Date         | Thời gian tạo             | Auto-generated              |
| updatedAt  | Date         | Thời gian cập nhật        | Auto-generated              |

# 3. CHỨC NĂNG ĐĂNG KÝ VÀ ĐĂNG NHẬP

## 3.1 Đăng ký người dùng

**Backend Flow:**

```typescript
// server/controllers/auth.controller.ts
async register(req: TypedRequest<{ TBody: RegisterRequest }>, res: Response) {
  const response = await authService.register(req.body);

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", response.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.status(CREATED).send({
    ...response.user,
    accessToken: response.accessToken,
  });
}
```

**Frontend Implementation:**

- Form validation với Ant Design
- Hash password trước khi gửi
- Xử lý response và redirect

## 3.2 Đăng nhập người dùng

**Backend Flow:**

```typescript
async login(req: TypedRequest<{ TBody: RegisterRequest }>, res: Response) {
  const response = await authService.login(req.body);

  res.cookie("refreshToken", response.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  res.status(OK).send({
    ...response.user,
    accessToken: response.accessToken,
  });
}
```

**Frontend Features:**

- Login form với email và password
- Error handling và user feedback
- Auto redirect sau khi đăng nhập thành công

# 4. HỆ THỐNG XÁC THỰC VÀ BẢO VỆ ROUTE

## 4.1 JWT Middleware

```typescript
// server/middlewares/validate-jwt.ts
const validateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    async (err, decoded: any) => {
      if (err) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      req.user = decoded;
      next();
    }
  );
};
```

## 4.2 Role-based Access Control

**Role Validation Middleware:**

```typescript
// server/middlewares/validate-role.ts
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/express";

const validateRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    console.log("User role:", userRole);
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
};

export default validateRole;

// Kiểm tra quyền admin để truy cập các chức năng quản lý
```

## 4.3 Refresh Token System

**Đặc điểm:**

- Access token có thời gian sống ngắn (15 phút)
- Refresh token lưu trong httpOnly cookie (24 giờ)
- Auto refresh khi access token hết hạn
- Secure cookie với sameSite protection

## 4.4 Frontend Route Protection

```typescript
// frontend/src/layout/persistent-login.tsx
// Protected routes với authentication check
// Auto redirect về login nếu chưa authenticated

const [loading, setLoading] = useState(true);

const { auth, isLoggedOut } = useAuth();

const refresh = useRefreshToken(isInProtectedRoutes);
useEffect(() => {
  const verifyToken = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error("Refresh token error:", error);
    } finally {
      setLoading(false);
    }
  };

  !auth?.accessToken && !isLoggedOut ? verifyToken() : setLoading(false);
}, [auth, refresh, isLoggedOut]);
```

# 5. QUẢN LÝ DANH SÁCH NGƯỜI DÙNG

## 5.1 API Endpoints

```typescript
// GET /users/list - Lấy danh sách người dùng với pagination
async getAllUsers(request: TypedRequest<{ TQuery: PaginationUserRequest }>, res: Response) {
  const pagedResult = await userService.getAllUsers(request.query);
  res.status(OK).send(pagedResult.response);
}
```

## 5.2 Pagination & Filtering

**Query Parameters:**

- `page`: Số trang (default: 1)
- `limit`: Số record per page (default: 10)
- `search`: Tìm kiếm theo tên hoặc email
- `role`: Filter theo role
- `provider`: Filter theo provider
- `status`: Filter theo trạng thái (active/banned)
- `sortBy`: Sắp xếp theo trường
- `sortOrder`: Thứ tự sắp xếp (asc/desc)

## 5.3 Frontend Implementation

```tsx
// frontend/src/pages/user-management/index.tsx
export default function UserManagement() {
  const { getParamsString, shouldResetFilters, deleteAllFilters } =
    useUserFilter();

  const { data, isLoading, error } = useFetchData<Pagination<User>>(
    `/users/list?${getParamsString()}`,
    { type: "private" }
  );

  return (
    <section>
      <UserTable users={data} isLoading={isLoading} />
      <SearchUser />
    </section>
  );
}
```

# 6. THÊM VÀ SỬA NGƯỜI DÙNG

## 6.1 Thêm người dùng mới

**Backend API:**

```typescript
async addUser(request: TypedRequest<{ TBody: UserRequest }>, res: Response) {
  const user = await userService.addUser(request.body);
  res.status(CREATED).send(user);
}
```

**Validation Schema:**

- Email format validation
- Password strength requirements
- Required fields checking
- Unique email constraint

## 6.2 Cập nhật thông tin người dùng

**Backend API:**

```typescript
async editUser(
  request: TypedRequest<{ TBody: UserRequest; TParams: { id: string } }>,
  res: Response
) {
  const { id } = request.params;
  const userData = request.body;

  const updatedUser = await userService.editUser(id, userData);
  res.status(OK).send(updatedUser);
}
```

## 6.3 Frontend Form Component

**UserForm Features:**

- Dynamic form cho cả Add và Edit mode
- Real-time validation
- Avatar upload functionality
- Role selection dropdown
- Submit handling với loading states

# 7. XÓA NGƯỜI DÙNG

## 7.1 Delete Implementation

```typescript
async deleteUser(request: TypedRequest<{ TParams: { id: string } }>, res: Response) {
  const { id } = request.params;
  await userService.deleteUser(id);
  res.status(NO_CONTENT).send();
}
```

## 7.2 Ban/Unban User

```typescript
async banUser(
  request: TypedRequest<{
    TParams: { id: string };
    TBody: { isBanned: boolean };
  }>,
  res: Response
) {
  const { id } = request.params;
  const { isBanned } = request.body;
  await userService.banUser(id, isBanned);

  res.status(NO_CONTENT).send();
}
```

## 7.3 Frontend Delete Confirmation

- Modal xác nhận trước khi xóa
- Loading state khi đang process
- Success/Error notification
- Auto refresh table sau khi xóa

# 8. GIAO DIỆN NGƯỜI DÙNG (UI)

## 8.1 User Management Dashboard

**Thành phần chính:**

- Header với title và nút "Add User"
- Search và filter bar
- Data table với pagination
- Action buttons (Edit, Delete, Ban/Unban)

## 8.2 User Table Features

```tsx
// frontend/src/pages/user-management/_components/user-table.tsx
const columns: TableProps<User>["columns"] = [
  {
    key: "user",
    title: "User",
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <img
          src={record.avatar || defaultAvatar}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <span
            className={cn("font-medium", {
              "line-through text-red-800": record.isBanned,
            })}
          >
            {record.fullName}
          </span>
          <span className="text-sm text-gray-500">{record.email}</span>
        </div>
      </div>
    ),
  },
  // ... other columns
];
```

## 8.3 UI Components

**1. SearchUser Component:**

- Real-time search input
- Filter dropdowns (Role, Provider, Status)
- Reset filters button

**2. UserForm Component:**

- Modal form cho Add/Edit
- Form validation với Ant Design
- Avatar upload preview
- Submit handling

**3. BanUser Component:**

- Quick ban/unban toggle
- Confirmation dialog
- Status indicator

**4. DeleteConfirm Component:**

- Reusable delete confirmation modal
- Custom warning messages
- Loading states

## 8.4 Responsive Design

- Mobile-friendly table với horizontal scroll
- Responsive form layout
- Touch-friendly buttons và controls
- Adaptive spacing và typography

## 8.5 UX Enhancements

**Loading States:**

- Skeleton loading cho table
- Button loading khi submit
- Progress indicators

**Error Handling:**

- Toast notifications cho success/error
- Form validation messages
- Network error handling

**Accessibility:**

- Keyboard navigation support
- Screen reader friendly
- ARIA labels và roles
- High contrast mode support

# 9. SECURITY FEATURES

## 9.1 Authentication Security

- JWT với short expiration time
- Secure httpOnly cookies cho refresh token
- CSRF protection với sameSite cookies
- Password hashing với bcrypt

## 9.2 Authorization

- Role-based access control
- Route protection middleware
- API endpoint protection
- Frontend route guards

## 9.3 Input Validation

- Server-side validation với Zod schemas
- Frontend validation với Ant Design
- XSS protection
- SQL injection prevention (MongoDB)
