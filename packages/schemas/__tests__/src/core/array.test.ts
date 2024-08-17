import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Array Tests', ({ test }) => {
  test('optional', async ({ expect }) => {
    const arraySchema = p.array([p.number()]);
    const tupleSchema = p.array(p.number(), p.string());
    const arraySchemaWithCustomMessage = p.array([p.number()]).nonOptional({ message: 'hello' });
    const tupleSchemaWithCustomMessage = p.array(p.number(), p.string()).nonOptional({ message: 'hello' });

    const [
      { errors: errorsArrayOnFail },
      { errors: errorsTupleOnFail },
      { errors: errorsArrayOnFailWithCustomMessage },
      { errors: errorsTupleOnFailWithCustomMessage },
      { errors: errorsOnValidArray, parsed: parsedArray },
      { errors: errorsOnValidTuple, parsed: parsedTuple }
    ] = await Promise.all([
      arraySchema.parse(undefined as any),
      tupleSchema.parse(undefined as any),
      arraySchemaWithCustomMessage.parse(undefined as any),
      tupleSchemaWithCustomMessage.parse(undefined as any),
      arraySchema.parse([1, 2, 3]),
      tupleSchema.parse([1, 'test'])
    ]);

    expect(errorsArrayOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsTupleOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsArrayOnFail?.[0]?.code).toBe('required');
    expect(errorsArrayOnFail?.[0]?.message).toBe('Required');
    expect(errorsTupleOnFail?.[0]?.code).toBe('required');
    expect(errorsTupleOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValidArray || []).length).toBe(0);
    expect(parsedArray[0]).toBe(1);
    expect(parsedArray[2]).toBe(3);
    expect((errorsOnValidTuple || []).length).toBe(0);
    expect(parsedTuple[0]).toBe(1);
    expect(parsedTuple[1]).toBe('test');
  });

  test('nullable', async ({ expect }) => {
    const arraySchema = p.array([p.number()]);
    const tupleSchema = p.array(p.number(), p.string());
    const arraySchemaWithCustomMessage = p.array([p.number()]).nonNullable({ message: 'hello' });
    const tupleSchemaWithCustomMessage = p.array(p.number(), p.string()).nonNullable({ message: 'hello' });

    const [
      { errors: errorsArrayOnFail },
      { errors: errorsTupleOnFail },
      { errors: errorsArrayOnFailWithCustomMessage },
      { errors: errorsTupleOnFailWithCustomMessage },
      { errors: errorsOnValidArray, parsed: parsedArray },
      { errors: errorsOnValidTuple, parsed: parsedTuple }
    ] = await Promise.all([
      arraySchema.parse(null as any),
      tupleSchema.parse(null as any),
      arraySchemaWithCustomMessage.parse(null as any),
      tupleSchemaWithCustomMessage.parse(null as any),
      arraySchema.parse([1, 2, 3]),
      tupleSchema.parse([1, 'test'])
    ]);

    expect(errorsArrayOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsTupleOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsArrayOnFail?.[0]?.code).toBe('null');
    expect(errorsArrayOnFail?.[0]?.message).toBe('Cannot be null');
    expect(errorsTupleOnFail?.[0]?.code).toBe('null');
    expect(errorsTupleOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValidArray || []).length).toBe(0);
    expect(parsedArray[0]).toBe(1);
    expect(parsedArray[2]).toBe(3);
    expect((errorsOnValidTuple || []).length).toBe(0);
    expect(parsedTuple[0]).toBe(1);
    expect(parsedTuple[1]).toBe('test');
  });

  test('nonEmpty', async ({ expect }) => {
    const arraySchema = p.array([p.number()]).nonEmpty();
    const arraySchemaWithCustomMessage = p.array([p.number()]).nonEmpty({ message: 'hello' });

    const [
      { errors: errorsArrayOnFail },
      { errors: errorsArrayOnFailWithCustomMessage },
      { errors: errorsOnValidArray, parsed: parsedArray }
    ] = await Promise.all([
      arraySchema.parse([]),
      arraySchemaWithCustomMessage.parse([]),
      arraySchema.parse([1, 2, 3])
    ]);

    expect(errorsArrayOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsArrayOnFail?.[0]?.code).toBe('null');
    expect(errorsArrayOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValidArray || []).length).toBe(0);
    expect(parsedArray[0]).toBe(1);
    expect(parsedArray[2]).toBe(3);
    expect((errorsOnValidTuple || []).length).toBe(0);
    expect(parsedTuple[0]).toBe(1);
    expect(parsedTuple[1]).toBe('test');
  });
});
