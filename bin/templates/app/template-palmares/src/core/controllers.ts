// @ts-nocheck
import { pathNested, Response } from '@palmares/server';

/** This is a circular import, remember to ALWAYS use `import type`. */
import type { healthCheckRoute } from './routes';

export const healthCheckController = pathNested<typeof healthCheckRoute>()()
  .get(() => {
    return Response.json({ status: 'ok' });
  })
