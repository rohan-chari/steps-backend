import { z } from 'zod';

export const StepsUpdateSchema = z.object({
  stepCount: z.number().int().min(0, 'Step count must be 0 or greater'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
});

export type StepsUpdateData = z.infer<typeof StepsUpdateSchema>;
