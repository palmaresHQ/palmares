import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Datetime Tests', ({ test }) => {
  test('optional', async ({ expect }) => {
    const datetimeSchema = p.datetime();
    const datetimeSchemaWithCustomMessage = p.datetime().nonOptional({ message: 'hello' });
    const now = new Date();

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        datetimeSchema.parse(undefined as any),
        datetimeSchemaWithCustomMessage.parse(undefined as any),
        datetimeSchema.parse(now)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.toISOString()).toBe(now.toISOString());
  });

  test('nullable', async ({ expect }) => {
    const datetimeSchema = p.datetime();
    const datetimeSchemaWithCustomMessage = p.datetime().nonNullable({ message: 'hello' });
    const now = new Date();

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        datetimeSchema.parse(null as any),
        datetimeSchemaWithCustomMessage.parse(null as any),
        datetimeSchema.parse(now)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.toISOString()).toBe(now.toISOString());
  });

  test('below', async ({ expect }) => {
    const nowMinus10Minutes = new Date();
    nowMinus10Minutes.setMinutes(-10);
    const nowMinus20Minutes = new Date();
    nowMinus20Minutes.setMinutes(-20);
    const datetimeSchema = p.datetime().below(nowMinus10Minutes);
    const datetimeSchemaWithCustomMessage = p
      .datetime()
      .below(nowMinus10Minutes, { message: 'hello', inclusive: false });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        datetimeSchema.parse(nowMinus10Minutes),
        datetimeSchemaWithCustomMessage.parse(nowMinus10Minutes),
        datetimeSchema.parse(nowMinus20Minutes)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('below');
    expect(errorsOnFail?.[0]?.message).toBe('Value is not below the specified date');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.toISOString()).toBe(nowMinus20Minutes.toISOString());
  });

  test('above', async ({ expect }) => {
    const nowPlus10Minutes = new Date();
    nowPlus10Minutes.setMinutes(nowPlus10Minutes.getMinutes() + 10);
    const nowPlus20Minutes = new Date();
    nowPlus20Minutes.setMinutes(nowPlus20Minutes.getMinutes() + 20);
    const datetimeSchema = p.datetime().above(nowPlus10Minutes);
    const datetimeSchemaWithCustomMessage = p
      .datetime()
      .below(nowPlus10Minutes, { message: 'hello', inclusive: false });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        datetimeSchema.parse(nowPlus10Minutes),
        datetimeSchemaWithCustomMessage.parse(nowPlus10Minutes),
        datetimeSchema.parse(nowPlus20Minutes)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('above');
    expect(errorsOnFail?.[0]?.message).toBe('Value is not above the specified date');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed.toISOString()).toBe(nowPlus20Minutes.toISOString());
  });

  test('allowString', async ({ expect }) => {
    const datetimeSchema = p.datetime().allowString();
    const now = new Date();

    const { errors: errorsOnValid, parsed } = await datetimeSchema.parse(now.toISOString());

    expect((errorsOnValid || []).length).toBe(0);
    expect((parsed as Date).toISOString()).toBe(now.toISOString());
  });
});
