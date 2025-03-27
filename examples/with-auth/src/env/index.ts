import { z } from '@palmares/zod-schema';

/**
 * here im not using directly @palmares/schemas cuz it requeries
 * use of async functions and drizzle does not support top-level await
 * */

const envSchema = z.object({
  APP_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  DATABASE_URL: z.string()
});

export const env = envSchema.parse(process.env);
