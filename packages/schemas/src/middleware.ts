import { Response } from '@palmares/server';

import type { Schema } from './schema/schema';
import type { Infer } from './types';
import type { Request } from '@palmares/server';

/**
 * Validates the request body and returns a response automatically, don't need to do anything else.
 */
export function schemaHandler<
  TInput extends Schema<any, any>,
  TOutput extends Schema<
    { input: Infer<TInput, 'output'>; internal: any; output: any; representation: any; validate: any },
    any
  > = TInput
>(input: TInput, output?: TOutput) {
  return async (
    request: Request<
      any,
      {
        body: Infer<TInput, 'input'>;
        headers: unknown & {
          'content-type': 'application/json';
        };
      }
    >
  ) => {
    const data = await request.json();
    const validatedData = await input.validate(data, { request });
    if (validatedData.isValid) {
      const savedData = (await validatedData.save()) as Infer<TOutput, 'representation'>;
      const status = request.method === 'POST' ? 201 : 200;
      if (output) return Response.json(await output.data(savedData), { status: status });
      return Response.json<
        Infer<TOutput, 'representation'>,
        {
          status: 200 | 201;
          headers: object & {
            'content-type': 'application/json';
          };
        }
      >(savedData, {
        status,
        headers: {
          'content-type': 'application/json'
        }
      });
    }

    return Response.json({ errors: validatedData.errors }, { status: 400 });
  };
}
