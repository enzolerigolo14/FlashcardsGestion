import { z } from 'zod';

export const createCollectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

export const updateCollectionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});
