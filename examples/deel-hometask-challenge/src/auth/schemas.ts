import * as z from 'zod';

export const depositSchema = z.object({
  amount: z.number(),
});
