import * as z from 'zod';

export const payForJobSchema = z.object({
  amount: z.number(),
});
