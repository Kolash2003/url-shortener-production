import { z } from "zod";

export const createLinkSchema = z.object({
  originalUrl: z.string().url("Must be a valid URL"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(32, "Slug must be at most 32 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens")
    .optional(),
  title: z.string().max(128).optional(),
  password: z.string().min(1).optional(),
  expiresAt: z.string().optional(),
  redirectType: z.enum(["301", "302"]).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateLinkSchema = z.object({
  originalUrl: z.string().url().optional(),
  slug: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  title: z.string().max(128).optional().nullable(),
  password: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  redirectType: z.enum(["301", "302"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const listLinksQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["Active", "Expired", "Scheduled"]).optional(),
  tag: z.string().optional(),
  sort: z.enum(["created_at", "clicks", "slug"]).optional().default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one id required"),
});

export const addTagsSchema = z.object({
  ids: z.array(z.string()).min(1),
  tag: z.string().min(1).max(32),
});
