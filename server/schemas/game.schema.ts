import z from "zod";

export const paginationGameSchema = z.object({
  pageSize: z
    .number()
    .min(1, "Page size must be at least 1")
    .catch(10)
    .optional(),
  currentPage: z.number().positive().catch(1).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["ascend", "descend"]).default("ascend").optional(),
  search: z.string().optional(),
  statuses: z.preprocess(
    (val) => (typeof val === "string" ? [val] : val),
    z.array(z.string()).optional()
  ),
});

export type PaginationGameRequest = z.infer<typeof paginationGameSchema>;
