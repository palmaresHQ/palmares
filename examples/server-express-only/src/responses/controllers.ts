import { FileLike, Request, Response, middleware, path, pathNested } from '@palmares/server';
import * as z from 'zod';

import type {
  arrayBufferRouter,
  baseRouter,
  baseRouterType,
  blobRouter,
  errorRouter,
  jsonRouter,
  streamRouter,
  textRouter
} from './routes';

export const blobResponseController = pathNested<typeof blobRouter>()().get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  return Response.file(blob);
});

export const arrayBufferController = pathNested<typeof arrayBufferRouter>()().get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  const arrayBuffer = await blob.arrayBuffer();
  return Response.file(arrayBuffer);
});

export const jsonController = pathNested<typeof jsonRouter>()().get(async () => {
  return Response.json({ hello: 'world' });
});

export const textController = pathNested<typeof textRouter>()().get(async () => {
  return new Response('Hello, world!');
});

// Test this with $ curl http://localhost:4000/responses/stream --no-buffer
export const streamController = pathNested<typeof streamRouter>()().get(async () => {
  return Response.stream(async function* () {
    yield 'Hello, ';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'world!\n';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'Streaming...\n';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'is working!';
  });
});

export const fileController = pathNested<typeof streamRouter>()().get(async () => {
  const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
  return Response.file(new FileLike(blob, 'hello.txt'));
});

export const errorController = pathNested<typeof errorRouter>()().get(
  async (request) => {
    return request.responses[404]('hey', 1);
  },
  {
    responses: {
      '400': (message: string) => Response.json({ message: message }, { status: 400 }),
      '404': (message: string, userId: number) => Response.json({ message: message, userId }, { status: 404 })
    }
  }
);
export const testTypeOfResponseOnHandlerOnMiddlewaresAndResponseOptionsController = pathNested<typeof baseRouterType>()(
  '/<userId: string>'
).get(
  (request) => {
    return request.responses[200]('hello');
  },
  {
    responses: {
      '201': () => Response.json({ body: 'hey' }, { status: 201 })
    }
  }
);

// Isso me permite criar coisas assim
export const schemaValidatorMiddleware = <TInputSchema extends z.ZodType, TOutputSchema extends z.ZodType>(schemas: {
  input: TInputSchema;
  output: TOutputSchema;
}) => {
  return middleware({
    request: (request) => {
      const body = schemas.input.parse(request.body);
      return request.clone({ body: body as z.infer<TInputSchema> });
    },
    options: {
      responses: {
        '200': (body: z.infer<TOutputSchema>) => Response.json({ ...body }, { status: 200 }),
        '201': (body: z.infer<TOutputSchema>) => Response.json({ ...body }, { status: 201 })
      }
    }
  });
};
path('')
  .middlewares([
    schemaValidatorMiddleware({
      input: z.object({
        userId: z.number()
      }),
      output: z.object({
        firstName: z.string(),
        lastName: z.string(),
        age: z.number()
      })
    })
  ])
  .get((request) => {
    request.body.userId;
    return Response.json({
      firstName: 'hey',
      lastName: 'hey',
      age: 1
    });
  });
