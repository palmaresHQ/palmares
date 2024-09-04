import Schema from './schema';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { is, nullable, optional } from '../validators/schema';
import {
  email,
  endsWith,
  includes,
  maxLength,
  minLength,
  regex,
  startsWith,
  stringValidation,
  uuid
} from '../validators/string';

import type { DefinitionsOfSchemaType } from './types';

export default class StringSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: string;
    output: string;
    internal: string;
    representation: string;
    validate: string;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType
> extends Schema<TType, TDefinitions> {
  protected fieldType = 'string';

  protected __is?: {
    value: TType['input'] | TType['input'][];
    message: string;
  };

  protected __email?: {
    message: string;
  };

  protected __uuid?: {
    message: string;
  };

  protected __minLength?: {
    value: number;
    message: string;
  };

  protected __maxLength?: {
    value: number;
    message: string;
  };

  protected __regex?: {
    value: RegExp;
    message: string;
  };
  protected __endsWith?: {
    value: string;
    message: string;
  };

  protected __startsWith?: {
    value: string;
    message: string;
  };

  protected __includes?: {
    value: string;
    message: string;
  };

  protected __type: {
    message: string;
    check: (value: TType['input']) => boolean;
  } = {
    message: 'Invalid type',
    check: (value: any) => {
      return typeof value === 'string';
    }
  };
  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'string',
          this,
          adapter,
          adapter.string,
          () => ({
            type: this.__type,
            is: this.__is,
            email: this.__email,
            uuid: this.__uuid,
            minLength: this.__minLength,
            maxLength: this.__maxLength,
            regex: this.__regex,
            endsWith: this.__endsWith,
            startsWith: this.__startsWith,
            includes: this.__includes,
            nullable: this.__nullable,
            optional: this.__optional,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow
            }
          }),
          {
            maxLength,
            minLength,
            endsWith,
            startsWith,
            email,
            uuid,
            is,
            regex,
            includes,
            nullable,
            optional
          },
          {
            validatorsIfFallbackOrNotSupported: stringValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            // eslint-disable-next-line ts/require-await
            fallbackIfNotSupported: async () => {
              return [];
            }
          }
        );
      },
      this,
      this.__transformedSchemas,
      options,
      'number'
    );
  }

  /**
   * This let's you refine the schema with custom validations. This is useful when you want to validate something that
   * is not supported by default by the schema adapter.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().refine((value) => {
   *   if (value < 0) return { code: 'invalid_number', message: 'The number should be greater than 0' };
   * });
   *
   * const { errors, parsed } = await numberSchema.parse(-1);
   *
   * // [{ isValid: false, code: 'invalid_number', message: 'The number should be greater than 0', path: [] }]
   * console.log(errors);
   * ```
   *
   * @param refinementCallback - The callback that will be called to validate the value.
   * @param options - Options for the refinement.
   * @param options.isAsync - Whether the callback is async or not. Defaults to true.
   */
  refine(
    refinementCallback: (
      value: TType['input']
    ) =>
      | Promise<void | undefined | { code: string; message: string }>
      | void
      | undefined
      | { code: string; message: string }
  ) {
    return super.refine(refinementCallback) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * Allows the value to be either undefined or null.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().optional();
   *
   * const { errors, parsed } = await numberSchema.parse(undefined);
   *
   * console.log(parsed); // undefined
   *
   * const { errors, parsed } = await numberSchema.parse(null);
   *
   * console.log(parsed); // null
   *
   * const { errors, parsed } = await numberSchema.parse(1);
   *
   * console.log(parsed); // 1
   * ```
   *
   * @returns - The schema we are working with.
   */
  optional() {
    return super.optional() as unknown as StringSchema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'] | undefined | null;
        internal: TType['internal'] | undefined | null;
        output: TType['output'] | undefined | null;
        representation: TType['representation'] | undefined | null;
      },
      TDefinitions
    >;
  }

  /**
   * Just adds a message when the value is undefined. It's just a syntax sugar for
   *
   * ```typescript
   * p.string().optional({ message: 'This value cannot be null', allow: false })
   * ```
   *
   * @param options - The options of nonOptional function
   * @param options.message - A custom message if the value is undefined.
   *
   * @returns - The schema.
   */
  nonOptional(options?: { message: string }) {
    return super.optional({
      message: options?.message,
      allow: false
    }) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * Allows the value to be null and ONLY null. You can also use this function to set a custom message when the value
   * is NULL by setting the { message: 'Your custom message', allow: false } on the options.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().nullable();
   *
   * const { errors, parsed } = await numberSchema.parse(null);
   *
   * console.log(parsed); // null
   *
   * const { errors, parsed } = await numberSchema.parse(undefined);
   *
   * console.log(errors); // [{ isValid: false, code: 'invalid_type', message: 'Invalid type', path: [] }]
   * ```
   *
   * @param options - The options for the nullable function.
   * @param options.message - The message to be shown when the value is not null. Defaults to 'Cannot be null'.
   * @param options.allow - Whether the value can be null or not. Defaults to true.
   *
   * @returns The schema.
   */
  nullable(options?: { message: string; allow: false }) {
    return super.nullable(options) as unknown as StringSchema<
      {
        input: TType['input'] | null;
        validate: TType['validate'] | null;
        internal: TType['internal'] | null;
        output: TType['output'] | null;
        representation: TType['representation'] | null;
      },
      TDefinitions
    >;
  }

  /**
   * Just adds a message when the value is null. It's just a syntax sugar for
   *
   * ```typescript
   * p.string().nullable({ message: 'This value cannot be null', allow: false })
   * ```
   *
   * @param options - The options of nonNullable function
   * @param options.message - A custom message if the value is null.
   *
   * @returns - The schema.
   */
  nonNullable(options?: { message: string }) {
    return super.nullable({
      message: options?.message || '',
      allow: false
    }) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * This method will remove the value from the representation of the schema. If the value is undefined it will keep
   * that way otherwise it will set the value to undefined after it's validated.
   * This is used in conjunction with the {@link data} function, the {@link parse} function or {@link validate}
   * function. This will remove the value from the representation of the schema.
   *
   * By default, the value will be removed just from the representation, in other words, when you call the {@link data}
   * function. But if you want to remove the value from the internal representation, you can pass the argument
   * `toInternal` as true. Then if you still want to remove the value from the representation, you will need to pass
   * the argument `toRepresentation` as true as well.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const userSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   *   password: p.string().omit()
   * });
   *
   * const user = await userSchema.data({
   *  id: 1,
   *  name: 'John Doe',
   *  password: '123456'
   * });
   *
   * console.log(user); // { id: 1, name: 'John Doe' }
   * ```
   *
   *
   * @param args - By default, the value will be removed just from the representation, in other words, when you call
   * the {@link data} function. But if you want to remove the value from the internal representation, you can pass the
   * argument `toInternal` as true. Then if you still want to remove the value from the representation, you will need
   * to pass the argument `toRepresentation` as true as well.
   *
   * @returns The schema.
   */
  omit<
    TToInternal extends boolean,
    TToRepresentation extends boolean = boolean extends TToInternal ? true : false
  >(args?: { toInternal?: TToInternal; toRepresentation?: TToRepresentation }) {
    return super.omit(args) as unknown as StringSchema<
      {
        input: TToInternal extends true ? TType['input'] | undefined : TType['input'];
        validate: TToInternal extends true ? TType['validate'] | undefined : TType['validate'];
        internal: TToInternal extends true ? undefined : TType['internal'];
        output: TToRepresentation extends true ? TType['output'] | undefined : TType['output'];
        representation: TToRepresentation extends true ? undefined : TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * This function is used in conjunction with the {@link validate} function. It's used to save a value to an external
   * source like a database. You should always return the schema after you save the value, that way we will always have
   * the correct type of the schema after the save operation.
   *
   * You can use the {@link toRepresentation} function to transform and clean the value it returns after the save.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * import { User } from './models';
   *
   * const userSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   *   email: p.string().email(),
   * }).onSave(async (value) => {
   *   // Create or update the user on the database using palmares models or any other library of your choice.
   *   if (value.id)
   *      await User.default.set(value, { search: { id: value.id } });
   *   else
   *      await User.default.set(value);
   *
   *   return value;
   * });
   *
   *
   * // Then, on your controller, do something like this:
   * const { isValid, save, errors } = await userSchema.validate(req.body);
   * if (isValid) {
   *    const savedValue = await save();
   *    return Response.json(savedValue, { status: 201 });
   * }
   *
   * return Response.json({ errors }, { status: 400 });
   * ```
   *
   * @param callback - The callback that will be called to save the value on an external source.
   *
   * @returns The schema.
   */
  onSave(
    callback: <TContext = any>(
      value: TType['internal'],
      context: TContext
    ) => Promise<TType['output']> | TType['output']
  ) {
    return super.onSave(callback) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions & {
        hasSave: true;
      }
    >;
  }

  /**
   * This function is used to add a default value to the schema. If the value is either undefined or null, the default
   * value will be used.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().default(0);
   *
   * const { errors, parsed } = await numberSchema.parse(undefined);
   *
   * console.log(parsed); // 0
   * ```
   */
  default<TDefaultValue extends TType['input'] | (() => Promise<TType['input']>)>(
    defaultValueOrFunction: TDefaultValue
  ) {
    return super.default(defaultValueOrFunction) as unknown as StringSchema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'] | undefined | null;
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * This function let's you customize the schema your own way. After we translate the schema on the adapter we call
   * this function to let you customize the custom schema your own way. Our API does not support passthrough?
   * No problem, you can use this function to customize the zod schema.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const numberSchema = p.number().extends((schema) => {
   *   return schema.nonnegative();
   * });
   *
   * const { errors, parsed } = await numberSchema.parse(-1);
   * // [{ isValid: false, code: 'nonnegative', message: 'The number should be nonnegative', path: [] }]
   * console.log(errors);
   * ```
   *
   * @param callback - The callback that will be called to customize the schema.
   * @param toStringCallback - The callback that will be called to transform the schema to a string when you want to
   * compile the underlying schema to a string so you can save it for future runs.
   *
   * @returns The schema.
   */
  extends(
    callback: (
      schema: Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['string']>['translate']>>
    ) => Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['field']>['translate']>> | any,
    toStringCallback?: (schemaAsString: string) => string
  ) {
    return super.extends(callback, toStringCallback);
  }

  /**
   * This function is used to transform the value to the representation of the schema. When using the {@link data}
   * function. With this function you have full control to add data cleaning for example, transforming the data and
   * whatever. Another use case is when you want to return deeply nested recursive data.
   * The schema maps to itself.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const recursiveSchema = p.object({
   *   id: p.number().optional(),
   *   name: p.string(),
   * }).toRepresentation(async (value) => {
   *    return {
   *      id: value.id,
   *      name: value.name,
   *      children: await Promise.all(value.children.map(async (child) => await recursiveSchema.data(child)))
   *    }
   * });
   *
   * const data = await recursiveSchema.data({
   *    id: 1,
   *    name: 'John Doe',
   * });
   * ```
   *
   * @example
   * ```
   * import * as p from '@palmares/schemas';
   *
   * const colorToRGBSchema = p.string().toRepresentation(async (value) => {
   *    switch (value) {
   *      case 'red': return { r: 255, g: 0, b: 0 };
   *      case 'green': return { r: 0, g: 255, b: 0 };
   *      case 'blue': return { r: 0, g: 0, b: 255 };
   *      default: return { r: 0, g: 0, b: 0 };
   *   }
   * });
   * ```
   * @param toRepresentationCallback - The callback that will be called to transform the value to the representation.
   *
   * @returns The schema with a new return type
   */
  toRepresentation<TRepresentation>(
    toRepresentationCallback: (value: TType['representation']) => Promise<TRepresentation>
  ) {
    return super.toRepresentation(toRepresentationCallback) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TRepresentation;
      },
      TDefinitions
    >;
  }

  /**
   * This function is used to transform the value to the internal representation of the schema. This is useful when
   * you want to transform the value to a type that the schema adapter can understand. For example, you might want
   * to transform a string to a date. This is the function you use.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   *
   * const dateSchema = p.string().toInternal((value) => {
   *   return new Date(value);
   * });
   *
   * const date = await dateSchema.parse('2021-01-01');
   *
   * console.log(date); // Date object
   *
   * const rgbToColorSchema = p.object({
   *   r: p.number().min(0).max(255),
   *   g: p.number().min(0).max(255),
   *   b: p.number().min(0).max(255),
   * }).toInternal(async (value) => {
   *    if (value.r === 255 && value.g === 0 && value.b === 0) return 'red';
   *    if (value.r === 0 && value.g === 255 && value.b === 0) return 'green';
   *    if (value.r === 0 && value.g === 0 && value.b === 255) return 'blue';
   *    return `rgb(${value.r}, ${value.g}, ${value.b})`;
   * });
   * ```
   *
   * @param toInternalCallback - The callback that will be called to transform the value to the internal representation.
   *
   * @returns The schema with a new return type.
   */
  toInternal<TInternal>(toInternalCallback: (value: TType['validate']) => Promise<TInternal>) {
    return super.toInternal(toInternalCallback) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TInternal;
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * Called before the validation of the schema. Let's say that you want to validate a date that might receive a string,
   * you can convert that string to a date here BEFORE the validation. This pretty much transforms the value to a
   * type that the schema adapter can understand.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schemas';
   * import * as z from 'zod';
   *
   * const customRecordToMapSchema = p.schema().appendSchema(z.map()).toValidate(async (value) => {
   *    return new Map(value); // Before validating we transform the value to a map.
   * });
   *
   * const { errors, parsed } = await customRecordToMapSchema.parse({ key: 'value' });
   * ```
   *
   * @param toValidateCallback - The callback that will be called to validate the value.
   *
   * @returns The schema with a new return type.
   */
  toValidate<TValidate>(toValidateCallback: (value: TType['input']) => Promise<TValidate> | TValidate) {
    return super.toValidate(toValidateCallback) as unknown as StringSchema<
      {
        input: TType['input'];
        validate: TValidate;
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions
    >;
  }

  /**
   * Defines a list of strings that are allowed, it's useful when you want to restrict the values that are allowed.
   * Like a selector or a Choice field.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().is(['Argentina', 'Brazil', 'Chile']);
   *
   * schema.parse('Argentina'); // { errors: [], parsed: 'Argentina' }
   * // { errors: [{
   * //   code: 'invalid_value',
   * //   message: 'The value should be equal to Argentina, Brazil, Chile',
   * //   path: [] }], parsed: 'Uruguay' }
   * schema.parse('Uruguay');
   * ```
   *
   * @param value - The list of numbers that are allowed
   *
   * @returns - The schema instance
   */
  is<const TValue extends TType['input'][]>(
    value: TValue,
    options?: Partial<Omit<NonNullable<StringSchema['__is']>, 'value'>>
  ) {
    this.__is = {
      value,
      message:
        typeof options?.message === 'string' ? options.message : `The value should be equal to ${value.join(', ')}`
    };

    return this as any as Schema<
      {
        input: TValue[number];
        output: TValue[number];
        internal: TValue[number];
        representation: TValue[number];
        validate: TValue[number];
      },
      TDefinitions
    >;
  }

  /**
   * Validates if the string ends with a specific value.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().endsWith('.com');
   *
   * schema.parse('example.com'); // { errors: [], parsed: 'example.com' }
   *
   * // { errors: [{ code: 'endsWith', message: 'The value should end with .com', path: [] }], parsed: 'example.org' }
   * schema.parse('example.org');
   * ```
   *
   * @param value - The value that the string should end with.
   * @param options - The options for the endsWith function.
   * @param options.message - The message to be shown when the value does not end with the value.
   *
   * @returns - The schema instance.
   */
  endsWith(value: string, options?: Partial<Omit<NonNullable<StringSchema['__endsWith']>, 'value'>>) {
    this.__endsWith = {
      value,
      message: options?.message || `The value should end with ${value}`
    };
    return this;
  }

  /**
   * Validates if the string starts with a specific value.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().startsWith('https://');
   *
   * schema.parse('https://example.com'); // { errors: [], parsed: 'https://example.com' }
   * // {
   * //   errors: [{ code: 'startsWith', message: 'The value should start with https://', path: [] }],
   * //   parsed: 'http://example.com'
   * // }
   * schema.parse('http://example.com');
   * ```
   *
   * @param value - The value that the string should start with.
   * @param options - The options for the startsWith function.
   * @param options.message - The message to be shown when the value does not start with the value.
   *
   * @returns - The schema instance.
   */
  startsWith(value: string, options?: Partial<Omit<NonNullable<StringSchema['__startsWith']>, 'value'>>) {
    this.__startsWith = {
      value,
      message: options?.message || `The value should start with ${value}`
    };
    return this;
  }

  /**
   * Checks if the string includes a specific substring.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().includes('for babies');
   *
   * schema.parse('Computer graphics for babies'); // { errors: [], parsed: 'Computer graphics for babies' }
   * // {
   * //   errors: [{
   * //     code: 'includes',
   * //     message: 'The string value should include the following substring 'for babies',
   * //     path: []
   * //   }], parsed: 'example.org' }
   * schema.parse('Learn javascript as you were 5');
   * ```
   *
   * @param value - The value that the string should include.
   * @param options - The options for the includes function.
   * @param options.message - The message to be shown when the value does not include the value.
   *
   * @returns - The schema instance.
   */
  includes(value: string, options?: Partial<Omit<NonNullable<StringSchema['__includes']>, 'value'>>) {
    this.__includes = {
      value,
      message: options?.message || `The string value should include the following substring '${value}'`
    };
    return this;
  }

  /**
   * Validates if the string matches a specific regex.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().regex(/^[a-z]+$/);
   *
   * schema.parse('abc'); // { errors: [], parsed: 'abc' }
   * // {
   * //   errors: [{
   * //     code: 'regex',
   * //     message: 'The value should match the following regex /^[a-z]+$/',
   * //     path: []
   * //   }],
   * //   parsed: '123'
   * // }
   * schema.parse('123');
   * ```
   *
   * @param value - The regex that the string should match.
   * @param options - The options for the regex function.
   * @param options.message - The message to be shown when the value does not match the regex.
   *
   * @returns - The schema instance.
   */
  regex(value: RegExp, options?: Partial<Omit<NonNullable<StringSchema['__regex']>, 'value'>>) {
    this.__regex = {
      value,
      message: options?.message || `The value should match the following regex '${value.toString()}'`
    };
    return this;
  }

  /**
   * Validates if the string has a maximum length. Use { inclusive: true } to allow the value to have the same length
   * as the maximum length.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().maxLength(5);
   *
   * schema.parse('12345'); // { errors: [], parsed: '12345' }
   * // {
   * //   errors: [{ code: 'maxLength', message: 'The value should have a maximum length of 5', path: [] }],
   * //   parsed: '123
   * //   }
   * schema.parse('123456');
   * ```
   *
   * @param value - The maximum length that the string should have.
   * @param options - The options for the maxLength function.
   * @param options.message - The message to be shown when the value has a length greater than the maximum length.
   * @param options.inclusive - Whether the value can have the same length as the maximum length. Defaults to false.
   *
   * @returns - The schema instance.
   */
  maxLength(value: number, options?: Partial<Omit<NonNullable<StringSchema['__maxLength']>, 'value'>>) {
    this.__maxLength = {
      value,
      message: options?.message || `The value should have a maximum length of ${value}`
    };
    return this;
  }

  /**
   * Validates if the string has a minimum length. Use { inclusive: true } to allow the value to have the same length
   * as the minimum length.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().minLength(5);
   *
   * schema.parse('12345'); // { errors: [], parsed: '12345' }
   * // {
   * //   errors: [{ code: 'minLength', message: 'The value should have a minimum length of 5', path: [] }],
   * //   parsed: '1234'
   * // }
   * schema.parse('1234');
   * ```
   *
   * @param value - The minimum length that the string should have.
   * @param options - The options for the minLength function.
   * @param options.message - The message to be shown when the value has a length less than the minimum length.
   * @param options.inclusive - Whether the value can have the same length as the minimum length. Defaults to false.
   *
   * @returns - The schema instance.
   */
  minLength(value: number, options?: Partial<Omit<NonNullable<StringSchema['__minLength']>, 'value'>>) {
    this.__minLength = {
      value,
      message: options?.message || `The value should have a minimum length of ${value}`
    };
    return this;
  }

  /**
   * Validates if the string is a valid UUID.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().uuid();
   *
   * // { errors: [], parsed: '550e8400-e29b-41d4-a716-446655440000' }
   * schema.parse('550e8400-e29b-41d4-a716-446655440000');
   * ```
   *
   * @param options - The options for the uuid function.
   * @param options.message - The message to be shown when the value is not a valid UUID. Defaults to
   * 'The value should be a valid UUID'.
   *
   * @returns - The schema instance.
   */
  uuid(options?: StringSchema['__uuid']) {
    this.__uuid = {
      message: options?.message || 'The value should be a valid UUID'
    };
    return this;
  }

  /**
   * Validates if the string is a valid email or not
   *
   * @example
   * ```typescript
   *
   * import * as p from '@palmares/schema';
   *
   * const schema = p.string().email();
   *
   * schema.parse('john.doe@example.com'); // { errors: [], parsed: 'john.doe@example.com' }
   * ```
   *
   * @param options - The options for the email function.
   * @param options.message - The message to be shown when the value is not a valid email.
   * Defaults to 'The value should be a valid email'.
   *
   * @returns - The schema instance.
   */
  email(options?: StringSchema['__email']) {
    this.__email = {
      message: options?.message || 'The value should be a valid email'
    };
    return this;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType>() {
    const returnValue = new StringSchema<
      {
        input: string;
        output: string;
        internal: string;
        representation: string;
        validate: string;
      },
      TDefinitions
    >();

    return returnValue;
  }
}

export const string = StringSchema.new;
