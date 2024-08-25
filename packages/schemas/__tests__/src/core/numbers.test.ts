import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Number Tests', ({ test }) => {
  test('optional', async ({ expect }) => {
    const numberSchema = p.number();
    const numberSchemaWithCustomMessage = p.number().nonOptional({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(undefined as any),
        numberSchemaWithCustomMessage.parse(undefined as any),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('nullable', async ({ expect }) => {
    const numberSchema = p.number();
    const numberSchemaWithCustomMessage = p.number().nonNullable({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(null as any),
        numberSchemaWithCustomMessage.parse(null as any),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('maxDigits', async ({ expect }) => {
    const numberSchema = p.number().maxDigits(5);
    const numberSchemaWithCustomMessage = p.number().maxDigits(5, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(1234567),
        numberSchemaWithCustomMessage.parse(1234567),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('maxDigits');
    expect(errorsOnFail?.[0]?.message).toBe('The number should have at most 5 digits');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('decimalPlaces', async ({ expect }) => {
    const numberSchema = p.number().decimalPlaces(2);
    const numberSchemaWithCustomMessage = p.number().decimalPlaces(2, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(123.4567),
        numberSchemaWithCustomMessage.parse(123.4567),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('decimalPlaces');
    expect(errorsOnFail?.[0]?.message).toBe('The number should have 2 decimal places');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('is', async ({ expect }) => {
    const numberSchema = p.number().is([1, 2]);
    const numberSchemaWithCustomMessage = p.number().is([1, 2], { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(123.4567 as any),
        numberSchemaWithCustomMessage.parse(123.4567 as any),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('is');
    expect(errorsOnFail?.[0]?.message).toBe('The value should be equal to 1,2');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('is', async ({ expect }) => {
    const numberSchema = p.number().is([1, 2]);
    const numberSchemaWithCustomMessage = p.number().is([1, 2], { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(123.4567 as any),
        numberSchemaWithCustomMessage.parse(123.4567 as any),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('is');
    expect(errorsOnFail?.[0]?.message).toBe('The value should be equal to 1,2');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('integer', async ({ expect }) => {
    const numberSchema = p.number().integer();
    const numberSchemaWithCustomMessage = p.number().integer({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(123.4567 as any),
        numberSchemaWithCustomMessage.parse(123.4567 as any),
        numberSchema.parse(1)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('integer');
    expect(errorsOnFail?.[0]?.message).toBe('The number should be an integer.');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(1);
  });

  test('max', async ({ expect }) => {
    const numberSchema = p.number().max(100, { inclusive: true });
    const numberSchemaWithCustomMessage = p.number().max(100, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        numberSchema.parse(123 as any),
        numberSchemaWithCustomMessage.parse(123 as any),
        numberSchema.parse(100)
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('max');
    expect(errorsOnFail?.[0]?.message).toBe(
      'The number is greater than the allowed 100. The value 100 is accepted as well.'
    );
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(100);
  });

  test('min', async ({ expect }) => {
    const numberSchema = p.number().min(100, { inclusive: true });
    const numberSchemaWithCustomMessage = p.number().min(100, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([numberSchema.parse(1), numberSchemaWithCustomMessage.parse(1), numberSchema.parse(100)]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('min');
    expect(errorsOnFail?.[0]?.message).toBe(
      'The number is less than the allowed 100. The value 100 is accepted as well.'
    );
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe(100);
  });

  test('allowString', async ({ expect }) => {
    const numberSchema = p.number().allowString();

    const { errors, parsed } = await numberSchema.parse('100');

    expect((errors || []).length).toBe(0);
    expect(parsed).toBe(100);
  });
});
