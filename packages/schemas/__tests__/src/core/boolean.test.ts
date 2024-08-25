import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Boolean Tests', ({ test }) => {
  test('optional', async ({ expect }) => {
    const booleanSchema = p.boolean();
    const booleanSchemaWithCustomMessage = p.boolean().nonOptional({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        booleanSchema.parse(undefined as any),
        booleanSchemaWithCustomMessage.parse(undefined as any),
        booleanSchema.parse(true)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(true);
  });

  test('nullable', async ({ expect }) => {
    const booleanSchema = p.boolean();
    const booleanSchemaWithCustomMessage = p.boolean().nonNullable({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        booleanSchema.parse(null as any),
        booleanSchemaWithCustomMessage.parse(null as any),
        booleanSchema.parse(true)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(true);
  });

  test('true and false values', async ({ expect }) => {
    const booleanSchema = p.boolean().trueValues(['Y']).falseValues(['N']);

    const [{ errors: errorsTrue, parsed: parsedTrue }, { errors: errorsFalse, parsed: parsedFalse }] =
      await Promise.all([booleanSchema.parse('Y'), booleanSchema.parse('N')]);

    expect((errorsTrue || []).length).toBe(0);
    expect((errorsFalse || []).length).toBe(0);
    expect(parsedTrue).toBe(true);
    expect(parsedFalse).toBe(false);
  });

  test('number and string values', async ({ expect }) => {
    const booleanSchema = p.boolean().allowNumber().allowString();

    const [{ errors: errorsNumber, parsed: parsedNumber }, { errors: errorsString, parsed: parsedString }] =
      await Promise.all([booleanSchema.parse(1), booleanSchema.parse('true')]);

    expect((errorsNumber || []).length).toBe(0);
    expect((errorsString || []).length).toBe(0);
    expect(parsedNumber).toBe(true);
    expect(parsedString).toBe(true);
  });
});
