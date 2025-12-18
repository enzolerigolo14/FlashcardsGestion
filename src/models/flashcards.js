import { z } from 'zod';

export const createFlashcardSchema = z.object({
  collectionId: z.number().int(),
  frontText: z.string().min(1),
  backText: z.string().optional(),
  frontUrl: z.string().url().optional().or(z.literal('')),
  backUrl: z.string().url().optional().or(z.literal(''))
});

export const updateFlashcardSchema = z.object({
  frontText: z.string().min(1).optional(),
  backText: z.string().optional(),
  frontUrl: z.string().url().optional().or(z.literal('')),
  backUrl: z.string().url().optional().or(z.literal(''))
});

export const reviewFlashcardSchema = z.object({
  success: z.boolean()
});
