import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Schema Types', ({ test }) => {
  test('number schema', async ({ expect }) => {
    const numberSchema = p.number();

    const { errors } = await numberSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('boolean schema', async ({ expect }) => {
    const booleanSchema = p.boolean();

    const { errors } = await booleanSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('date schema', async ({ expect }) => {
    const dateSchema = p.datetime();

    const { errors } = await dateSchema.parse('value' as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('string schema', async ({ expect }) => {
    const stringSchema = p.string();

    const { errors } = await stringSchema.parse(2 as any);

    expect((errors?.length || 0) > 0).toBe(true);
  });

  test('array schema', async ({ expect }) => {
    const tupleSchema = p.array(p.number(), p.string());
    const arraySchema = p.array([p.number()]);

    const [
      { errors: errorsOfInvalidArray },
      { errors: errorsOfInvalidTuple },
      { errors: errorsOfValidArray, parsed: parsedArray },
      { errors: errorsOfValidTuple, parsed: parsedTuple }
    ] = await Promise.all([
      arraySchema.parse('value' as any),
      tupleSchema.parse([1, 2, 3] as any),
      arraySchema.parse([1, 2, 3]),
      tupleSchema.parse([1, 'string'])
    ]);

    expect((errorsOfInvalidArray?.length || 0) > 0).toBe(true);
    expect((errorsOfInvalidTuple?.length || 0) > 0).toBe(true);
    expect(errorsOfValidArray?.length || 0).toBe(0);
    expect(errorsOfValidTuple?.length || 0).toBe(0);
    expect(parsedArray[0]).toBe(1);
    expect(parsedArray[1]).toBe(2);
    expect(parsedArray[2]).toBe(3);
    expect(parsedTuple[0]).toBe(1);
    expect(parsedTuple[1]).toBe('string');
  });

  test('object schema', async ({ expect }) => {
    const objectSchema = p.object({
      number: p.number(),
      string: p.string()
    });

    const [{ errors: errorsOfInvalid }, { errors: errorsOfValid, parsed }] = await Promise.all([
      objectSchema.parse('value' as any),
      objectSchema.parse({
        number: 1,
        string: 'string'
      })
    ]);

    expect((errorsOfInvalid?.length || 0) > 0).toBe(true);
    expect((errorsOfValid?.length || 0) === 0).toBe(true);
    expect(parsed.number).toBe(1);
    expect(parsed.string).toBe('string');
  });

  test('union schema', async ({ expect }) => {
    const unionSchema = p.union([p.string(), p.number()]);

    const [{ errors: errorsOfInvalid }, { errors: errorsOfValid, parsed }] = await Promise.all([
      unionSchema.parse(true as any),
      unionSchema.parse(2)
    ]);
    expect((errorsOfInvalid?.length || 0) > 0).toBe(true);
    expect((errorsOfValid?.length || 0) === 0).toBe(true);
    expect(parsed).toBe(2);
  });
});
