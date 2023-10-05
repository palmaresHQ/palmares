import { middleware, Response } from '@palmares/server';
import * as z from 'zod';

export const schemaValidatorMiddleware = <TInputSchema extends z.ZodType>(schema: TInputSchema) => {
  return middleware({
    request: async (request) => {
      try {
        const jsonData = await request.json();
        const body = schema.parse(jsonData);
        return request.clone({ body: body as z.infer<TInputSchema> });
      } catch (error) {
        const errorAsZodError = error as z.ZodError;
        return Response.json({ errors: errorAsZodError.errors }, { status: 400 });
      }
    },
  });
};
