import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  DEFAULT_NUMBER_INTEGER_EXCEPTION,
  DEFAULT_NUMBER_MAX_EXCEPTION,
  DEFAULT_NUMBER_MIN_EXCEPTION,
  DEFAULT_NUMBER_NEGATIVE_EXCEPTION
} from '../constants';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { max, min, numberValidation } from '../validators/number';

import type { DefinitionsOfSchemaType } from './types';
import type SchemaAdapter from '../adapter';

export default class NumberSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: number;
    output: number;
    validate: number;
    internal: number;
    representation: number;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType
> extends Schema<TType, TDefinitions> {
  protected __is!: {
    value: TType['input'][];
    message: string;
  };

  protected __integer!: {
    message: string;
  };

  protected __maxDigits!: {
    value: number;
    message: string;
  };

  protected __decimalPlaces!: {
    value: number;
    message: string;
  };

  protected __max!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __min!: {
    value: number;
    inclusive: boolean;
    message: string;
  };

  protected __allowNegative!: {
    allowZero: boolean;
    message: string;
  };

  protected __allowPositive!: {
    allowZero: boolean;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'number',
          this,
          adapter,
          adapter.number,
          () => ({
            is: this.__is,
            min: this.__min,
            allowNegative: this.__allowNegative,
            allowPositive: this.__allowPositive,
            max: this.__max,
            integer: this.__integer,
            optional: this.__optional,
            nullable: this.__nullable,
            maxDigits: this.__maxDigits,
            decimalPlaces: this.__decimalPlaces,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow
            }
          }),
          {
            max,
            min
          },
          {
            validatorsIfFallbackOrNotSupported: numberValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            // eslint-disable-next-line ts/require-await
            fallbackIfNotSupported: async () => {
              return [];
            }
          }
        );
      },
      this.__transformedSchemas,
      options,
      'number'
    );
  }

  /**
   * This let's you refine the schema with custom validations. This is useful when you want to validate something
   * that is not supported by default by the schema adapter.
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
   * console.log(errors);
   * // [{ isValid: false, code: 'invalid_number', message: 'The number should be greater than 0', path: [] }]
   * ```
   *
   * @param refinementCallback - The callback that will be called to validate the value.
   * @param options - Options for the refinement.
   * @param options.isAsync - Whether the callback is async or not. Defaults to true.
   *
   * @returns The schema.
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
    return super.refine(refinementCallback) as unknown as NumberSchema<
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
  optional(options?: { message: string; allow: false }) {
    return super.optional(options) as unknown as NumberSchema<
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
    return super.nullable(options) as unknown as NumberSchema<
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
   * This method will remove the value from the representation of the schema. If the value is undefined it will keep
   * that way otherwise it will set the value to undefined after it's validated.
   * This is used in conjunction with the {@link data} function, the {@link parse} function or {@link validate}
   * function. This will remove the value from the representation of the schema.
   *
   * By default, the value will be removed just from the representation, in other words, when you call the {@link data}
   * function.
   * But if you want to remove the value from the internal representation, you can pass the argument `toInternal`
   * as true. Then if you still want to remove the value from the representation, you will need to pass the argument
   * `toRepresentation` as true as well.
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
   * the {@link data} function.
   * But if you want to remove the value from the internal representation, you can pass the argument `toInternal`
   * as true. Then if you still want to remove the value from the representation, you will need to pass the argument
   * `toRepresentation` as true as well.
   *
   * @returns The schema.
   */
  omit<
    TToInternal extends boolean,
    TToRepresentation extends boolean = boolean extends TToInternal ? true : false
  >(args?: { toInternal?: TToInternal; toRepresentation?: TToRepresentation; parent?: boolean }) {
    return super.omit(args) as unknown as NumberSchema<
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
   * source like a database. You should always return the schema after you save the value, that way we will always
   * have the correct type of the schema after the save operation.
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
  onSave(callback: (value: TType['internal']) => Promise<TType['output']> | TType['output']) {
    return super.onSave(callback) as unknown as NumberSchema<
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
    return super.default(defaultValueOrFunction) as unknown as NumberSchema<
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
   *
   * console.log(errors);
   * // [{ isValid: false, code: 'nonnegative', message: 'The number should be nonnegative', path: [] }]
   * ```
   *
   * @param callback - The callback that will be called to customize the schema.
   * @param toStringCallback - The callback that will be called to transform the schema to a string when you
   * want to compile the underlying schema to a string so you can save it for future runs.
   *
   * @returns The schema.
   */
  extends(
    callback: (
      schema: Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['number']>['translate']>>
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
    return super.toRepresentation(toRepresentationCallback) as unknown as NumberSchema<
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
    return super.toInternal(toInternalCallback) as unknown as NumberSchema<
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
   * you can convert that string to a date
   * here BEFORE the validation. This pretty much transforms the value to a type that the schema adapter can understand.
   *
   * @example
   * ```
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
    return super.toValidate(toValidateCallback) as unknown as NumberSchema<
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
   * Defines a list of numbers that are allowed, it's not a range but the actual numbers that are allowed, it's useful
   * when you want to allow only specific set of numbers.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.number().is([1, 2, 3]);
   *
   * schema.parse(1); // { errors: [], parsed: 1 }
   * schema.parse(2); // { errors: [], parsed: 2 }
   * schema.parse(3); // { errors: [], parsed: 3 }
   * schema.parse(4); // { errors: [{ code: 'is', message: 'The value should be equal to 1,2,3' }], parsed: 4 }
   * ```
   *
   * @param value - The list of numbers that are allowed
   *
   * @returns - The schema instance
   */
  is<const TValue extends TType['input'][]>(value: TValue) {
    this.__is = {
      value,
      message: `The value should be equal to ${value.join(',')}`
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
   * Allows only numbers that are less than the value passed. If you want to allow the number to be equal to the value,
   * you can pass the option `inclusive` as `true`.
   * Otherwise, it will only allow numbers less than the value.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.number().max(10);
   *
   * schema.parse(10); // { errors: [{ code: 'max', message: 'The number should be less than 10' }], parsed: 10 }
   * schema.parse(9); // { errors: [], parsed: 9 }
   *
   * const schema = p.number().max(10, { inclusive: true });
   *
   * schema.parse(10); // { errors: [], parsed: 10 }
   * ```
   *
   * @param value - The value to compare with the number
   * @param options - The options to be passed to the validation
   * @param options.inclusive - If you want to allow the number to be equal to the value, you can pass this option
   * @param options.message - The message to be returned if the validation fails
   *
   * @returns - The schema instance
   */
  max(
    value: number,
    options?: {
      inclusive?: boolean;
      message?: string;
    }
  ) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options.inclusive : false;
    const message =
      typeof options?.message === 'string' ? options.message : DEFAULT_NUMBER_MAX_EXCEPTION(value, inclusive);
    this.__max = {
      value,
      inclusive,
      message
    };
    return this as unknown as NumberSchema<TType, TDefinitions> & { is: never };
  }

  /**
   * This method will validate if the number is greater than the value passed. If you want to allow the number to be
   * equal to the value, you can pass the option `inclusive` as `true`.
   * Otherwise, it will only allow numbers greater than the value.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.number().min(10);
   *
   * schema.parse(10); // { errors: [], parsed: 10 }
   * schema.parse(9); // { errors: [{ code: 'min', message: 'The number should be greater than 10' }], parsed: 9 }
   *
   * const schema = p.number().min(10, { inclusive: true });
   *
   * schema.parse(10); // { errors: [], parsed: 10 }
   * ```
   *
   * @param value - The value to compare with the number
   * @param options - The options to be passed to the validation
   * @param options.inclusive - If you want to allow the number to be equal to the value, you can pass this option
   * @param options.message - The message to be returned if the validation fails
   *
   * @returns - The schema instance
   */
  min(
    value: number,
    options?: {
      inclusive?: boolean;
      message?: string;
    }
  ) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options.inclusive : false;
    const message =
      typeof options?.message === 'string' ? options.message : DEFAULT_NUMBER_MIN_EXCEPTION(value, inclusive);

    this.__min = {
      value,
      inclusive,
      message
    };

    return this;
  }

  /**
   * Allows only negative numbers. If you want to allow zero, you can pass the option `allowZero` as `true`.
   * Otherwise, it will only allow negative numbers.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.number().negative();
   *
   * schema.parse(-10); // { errors: [], parsed: -10 }
   * schema.parse(0); // { errors: [{ code: 'negative', message: 'The number should be negative' }], parsed: 0 }
   *
   * const schema = p.number().negative({ allowZero: true });
   *
   * schema.parse(0); // { errors: [], parsed: 0 }
   * ```
   *
   * @param options - The options to be passed to the validation
   * @param options.allowZero - If you want to allow zero, you can pass this option as `true`.
   * Otherwise, it will only allow negative numbers.
   * @param options.message - The message to be returned if the validation fails
   *
   * @returns - The schema instance
   */
  negative(options?: { allowZero?: boolean; message?: string }) {
    const allowZero = typeof options?.allowZero === 'boolean' ? options.allowZero : true;
    const message =
      typeof options?.message === 'string' ? options.message : DEFAULT_NUMBER_NEGATIVE_EXCEPTION(allowZero);

    this.__allowNegative = {
      allowZero,
      message
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * Allows only positive numbers. If you want to allow zero, you can pass the option `allowZero` as `true`.
   * Otherwise, it will only allow positive numbers greater than zero.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.number().positive();
   *
   * schema.parse(10); // { errors: [], parsed: 10 }
   * schema.parse(0); // { errors: [{ code: 'positive', message: 'The number should be positive' }], parsed: 0 }
   *
   * const schema = p.number().positive({ allowZero: true });
   * schema.parse(0); // { errors: [], parsed: 0 }
   * ```
   *
   * @param options - The options to be passed to the validation
   * @param options.allowZero - If you want to allow zero, you can pass this option as `true`. Otherwise, it will only
   * allow positive numbers greater than zero.
   * @param options.message - The message to be returned if the validation fails
   *
   * @returns - The schema instance
   */
  positive(options?: { allowZero?: boolean; message?: string }) {
    const allowZero = typeof options?.allowZero === 'boolean' ? options.allowZero : true;
    const message =
      typeof options?.message === 'string' ? options.message : DEFAULT_NUMBER_NEGATIVE_EXCEPTION(allowZero);

    this.__allowPositive = {
      allowZero,
      message
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * This method will validate the number to have the exact number of decimal places. It's usually useful for decimal
   * numbers like currencies.
   *
   * @example
   * ```
   * const schema = number().decimalPlaces(2);
   *
   * schema.parse(10.00); // { errors: [], parsed: 10.00}
   *
   * schema.parse(10.000);
   * // { errors: [{ code: 'decimal_places', message: 'The number should have 2 decimal places' }], parsed: 10.000}
   * ```
   *
   * @param value - The number of decimal places.
   * @param options - The options.
   * @param options.message - The message to show if the validation fails.
   *
   * @returns The schema so you can chain other methods.
   */
  decimalPlaces(value: number, options?: { message?: string }) {
    const message =
      typeof options?.message === 'string' ? options.message : `The number should have ${value} decimal places`;

    this.__decimalPlaces = {
      value,
      message
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * This method will validate the number to have at most the number of digits specified. If used in conjunction with
   * {@link decimalPlaces}, this number should be bigger than the value of the decimal places.
   *
   * Think about that
   *
   * - If you have a number with 2 decimal places, the number 10.00 has 4 digits and 2 decimal places.
   * - The number 10.000 has 5 digits and 3 decimal places.
   *
   * @example
   * ```
   * const schema = number().maxDigits(4);
   *
   * schema.parse(10); // { errors: [], parsed: 10}
   * schema.parse(100); // { errors: [], parsed: 100}
   * schema.parse(1000); // { errors: [], parsed: 1000}
   * ```
   *
   * @param value - The maximum number of digits, counting the digits before and after the decimal point.
   * @param options - Custom options for the validation.
   * @param options.message - The message to show if the validation fails.
   *
   * @returns - The schema so you can chain other methods.
   */
  maxDigits(value: number, options?: { message?: string }) {
    const message =
      typeof options?.message === 'string' ? options.message : `The number should have at most ${value} digits`;

    this.__maxDigits = {
      value,
      message
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * With this method we will validate if the number is an integer. If it's not, we will return an error.
   *
   * @example
   * ```typescript
   * import * as p from '@palmares/schema';
   *
   * const schema = p.number().integer();
   *
   * schema.parse(10); // { errors: [], parsed: 10 }
   * schema.parse(10.1); // { errors: [{ code: 'integer', message: 'The number should be an integer' }], parsed: 10.1 }
   * ```
   *
   * @param options - The options to be passed to the validation
   * @param options.message - The message to be returned if the validation fails
   *
   * @returns - The schema instance
   */
  integer(options?: { message?: string }) {
    const message = typeof options?.message === 'string' ? options.message : DEFAULT_NUMBER_INTEGER_EXCEPTION();

    this.__integer = {
      message
    };
    return this as unknown as NumberSchema<
      {
        input: TType['input'];
        output: TType['output'];
        representation: TType['representation'];
        internal: TType['internal'];
        validate: TType['validate'];
      },
      TDefinitions
    >;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType>() {
    const returnValue = new NumberSchema<
      {
        input: number;
        output: number;
        internal: number;
        representation: number;
        validate: number;
      },
      TDefinitions
    >();

    return returnValue;
  }
}

export const number = <TDefinitions extends DefinitionsOfSchemaType>() => NumberSchema.new<TDefinitions>();
