import * as p from '@palmares/schemas';
import { describe } from '@palmares/tests';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('String Schema', ({ test }) => {
  test('optional', async ({ expect }) => {
    const stringSchema = p.string();
    const stringSchemaWithCustomMessage = p.string().nonOptional({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse(undefined as any),
        stringSchemaWithCustomMessage.parse(undefined as any),
        stringSchema.parse('a')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('required');
    expect(errorsOnFail?.[0]?.message).toBe('Required');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('a');
  });

  test('nullable', async ({ expect }) => {
    const stringSchema = p.string();
    const stringSchemaWithCustomMessage = p.string().nonNullable({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse(null as any),
        stringSchemaWithCustomMessage.parse(null as any),
        stringSchema.parse('a')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('null');
    expect(errorsOnFail?.[0]?.message).toBe('Cannot be null');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('a');
  });

  test('is', async ({ expect }) => {
    const stringSchema = p.string().is(['a', 'b']);
    const stringSchemaWithCustomMessage = p.string().is(['a', 'b'], { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('c' as any),
        stringSchemaWithCustomMessage.parse('c' as any),
        stringSchema.parse('a')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('is');
    expect(errorsOnFail?.[0]?.message).toBe('The value should be equal to a, b');
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('a');
  });

  test('includes', async ({ expect }) => {
    const stringSchema = p.string().includes('Hello');
    const stringSchemaWithCustomMessage = p.string().includes('Hello', { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('World'),
        stringSchemaWithCustomMessage.parse('World'),
        stringSchema.parse('Hello World')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('includes');
    expect(errorsOnFail?.[0]?.message).toBe(`The string value should include the following substring 'Hello'`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello World');
  });

  test('maxLength', async ({ expect }) => {
    const stringSchema = p.string().maxLength(8);
    const stringSchemaWithCustomMessage = p.string().maxLength(8, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Hello World'),
        stringSchemaWithCustomMessage.parse('Hello World'),
        stringSchema.parse('Hello')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('maxLength');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should have a maximum length of 8`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello');
  });

  test('minLength', async ({ expect }) => {
    const stringSchema = p.string().minLength(8);
    const stringSchemaWithCustomMessage = p.string().minLength(8, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse(''),
        stringSchemaWithCustomMessage.parse(''),
        stringSchema.parse('Hello World')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('minLength');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should have a minimum length of 8`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello World');
  });

  test('startsWith', async ({ expect }) => {
    const stringSchema = p.string().startsWith('Hello');
    const stringSchemaWithCustomMessage = p.string().startsWith('Hello', { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Palmares, the best FW in the world!!!!!'),
        stringSchemaWithCustomMessage.parse(`I actually think it's bad`),
        stringSchema.parse('Hello, World')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('startsWith');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should start with Hello`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello, World');
  });

  test('endsWith', async ({ expect }) => {
    const stringSchema = p.string().endsWith('World');
    const stringSchemaWithCustomMessage = p.string().endsWith('World', { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Palmares, the best FW in the world!!!!!'),
        stringSchemaWithCustomMessage.parse(`I actually think it's bad`),
        stringSchema.parse('Hello, World')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('endsWith');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should end with World`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello, World');
  });

  test('endsWith', async ({ expect }) => {
    const stringSchema = p.string().endsWith('World');
    const stringSchemaWithCustomMessage = p.string().endsWith('World', { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Palmares, the best FW in the world!!!!!'),
        stringSchemaWithCustomMessage.parse(`I actually think it's bad`),
        stringSchema.parse('Hello, World')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('endsWith');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should end with World`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello, World');
  });

  test('regex', async ({ expect }) => {
    const regex = new RegExp('Hello', 'g');
    const stringSchema = p.string().regex(regex);
    const stringSchemaWithCustomMessage = p.string().regex(regex, { message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Palmares, the best FW in the world!!!!!'),
        stringSchemaWithCustomMessage.parse(`I actually think it's bad`),
        stringSchema.parse('Hello, World')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('regex');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should match the following regex '/Hello/g'`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('Hello, World');
  });

  test('uuid', async ({ expect }) => {
    const stringSchema = p.string().uuid();
    const stringSchemaWithCustomMessage = p.string().uuid({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Palmares, the best FW in the world!!!!!'),
        stringSchemaWithCustomMessage.parse(`I actually think it's bad`),
        stringSchema.parse('f54bb64b-0aed-47f9-976e-a8900d86f6c9')
      ]);

    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('uuid');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should be a valid UUID`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('f54bb64b-0aed-47f9-976e-a8900d86f6c9');
  });

  test('email', async ({ expect }) => {
    const stringSchema = p.string().email();
    const stringSchemaWithCustomMessage = p.string().email({ message: 'hello' });

    const [{ errors: errorsOnFail }, { errors: errorsOnFailWithCustomMessage }, { errors: errorsOnValid, parsed }] =
      await Promise.all([
        stringSchema.parse('Palmares, the best FW in the world!!!!!'),
        stringSchemaWithCustomMessage.parse(`I actually think it's bad`),
        stringSchema.parse('test@test.com')
      ]);
    expect(errorsOnFailWithCustomMessage?.[0]?.message).toBe('hello');
    expect(errorsOnFail?.[0]?.code).toBe('email');
    expect(errorsOnFail?.[0]?.message).toBe(`The value should be a valid email`);
    expect((errorsOnValid || []).length).toBe(0);
    expect(parsed).toBe('test@test.com');
  });
});
