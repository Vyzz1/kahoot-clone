import z from "zod";

export const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  role: z.string().optional(),
  email: z.string().email("Invalid email format"),
  avatar: z.string().url().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
});

export type UserRequest = z.infer<typeof userSchema>;

export const paginationUserSchema = z.object({
  pageSize: z
    .number()
    .min(1, "Page size must be at least 1")
    .catch(10)
    .optional(),
  currentPage: z.number().positive().catch(1).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["ascend", "descend"]).default("ascend").optional(),
  search: z.string().optional(),
  providers: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).optional()
  ),

  statuses: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).optional()
  ),
});

// export const paginationUserSchema = z.object({
//   pageSize: z
//     .string()
//     .regex(/^\d+$/, "Page size must be a number")
//     .transform(Number)
//     .optional(),
//   currentPage: z
//     .string()
//     .regex(/^\d+$/, "Current page must be a number")
//     .transform(Number)
//     .optional(),
//   sortBy: z.string().optional(),
//   sortOrder: z.enum(["ascend", "descend"]).optional(),
//   search: z.string().optional(),
//   providers: z.union([z.string(), z.array(z.string())]).optional(),
//   statuses: z.union([z.string(), z.array(z.string())]).optional(),
// });

export type PaginationUserRequest = z.infer<typeof paginationUserSchema>;

export const banUserSchema = z.object({
  isBanned: z.boolean(),
});
