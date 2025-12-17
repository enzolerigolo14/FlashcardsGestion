import { z } from 'zod';



const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  authorId: z.number().int(),
});