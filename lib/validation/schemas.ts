import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().trim().min(3, "Pertanyaan terlalu pendek.").max(1200),
  sessionId: z.string().uuid().optional(),
});

export const feedbackSchema = z.object({
  messageId: z.string().uuid(),
  rating: z.enum(["helpful", "not_helpful"]),
  comment: z.string().trim().max(1000).optional(),
});

export const documentMetadataSchema = z.object({
  title: z.string().trim().min(3).max(180),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1000).optional().nullable(),
  documentType: z.enum(["table", "long_form", "mixed"]),
  documentDate: z.string().date().optional().nullable(),
  effectiveDate: z.string().date().optional().nullable(),
  effectiveUntil: z.string().date().optional().nullable(),
  revisionLabel: z.string().trim().max(80).optional().nullable(),
  authorityRank: z.coerce.number().int().min(0).max(100).default(0),
});

export const manualSectionsSchema = z.object({
  sections: z.array(
    z.object({
      pageStart: z.number().int().positive(),
      pageEnd: z.number().int().positive(),
      title: z.string().max(240).nullable(),
      type: z.enum(["heading", "paragraph", "table", "mixed"]),
      text: z.string().min(1),
      structuredContent: z.record(z.string(), z.unknown()).nullable(),
      needsReview: z.boolean().default(false),
    }),
  ),
});
