import Schema from './schema';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { above, allowStringParser, below, datetimeValidation } from '../validators/datetime';
import { nullable, optional } from '../validators/schema';

import type { DefinitionsOfSchemaType } from './types';

export default class DatetimeSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: Date;
    output: string;
    internal: Date;
    representation: string;
    validate: Date;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType
> extends Schema<TType, TDefinitions> {
  protected __allowString!: boolean;

  protected __above!: {
    value: Date;
    inclusive: boolean;
    message: string;
  };
  protected __below!: {
    value: Date;
    inclusive: boolean;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'datetime',
          this,
          adapter,
          adapter.datetime,
          () => ({
            allowString: this.__allowString,
            below: this.__below,
            above: this.__above,
            nullable: this.__nullable,
            optional: this.__optional,
            type: this.__type,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow
            }
          }),
          {
            optional,
            nullable,
            allowString: allowStringParser,
            above,
            below
          },
          {
            validatorsIfFallbackOrNotSupported: datetimeValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            // eslint-disable-next-line ts/require-await
            fallbackIfNotSupported: async () => []
          }
        );
      },
      this,
      this.__transformedSchemas,
      options,
      'datetime'
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
   * // [{ isValid: false, code: 'invalid_number', message: 'The number should be greater than 0', path: [] }]
   * console.log(errors);
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
    return super.refine(refinementCallback) as unknown as DatetimeSchema<
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
    return super.optional(options) as unknown as DatetimeSchema<
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
   * p.datetime().optional({ message: 'This value should be defined', allow: false })
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
    }) as unknown as DatetimeSchema<
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
    return super.nullable(options) as unknown as DatetimeSchema<
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
   * p.datetime().nullable({ message: 'This value cannot be null', allow: false })
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
    }) as unknown as DatetimeSchema<
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
   * function.But if you want to remove the value from the internal representation, you can pass the argument
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
   * the {@link data} function.
   * But if you want to remove the value from the internal representation, you can pass the argument `toInternal` as
   * true. Then if you still want to remove the value from the representation, you will need to pass the argument
   * `toRepresentation` as true as well.
   *
   * @returns The schema.
   */
  omit<
    TToInternal extends boolean,
    TToRepresentation extends boolean = boolean extends TToInternal ? true : false
  >(args?: { toInternal?: TToInternal; toRepresentation?: TToRepresentation }) {
    return super.omit(args) as unknown as DatetimeSchema<
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
  onSave(callback: (value: TType['internal']) => Promise<TType['output']> | TType['output']) {
    return super.onSave(callback) as unknown as DatetimeSchema<
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
    return super.default(defaultValueOrFunction) as unknown as DatetimeSchema<
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
      schema: Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['datetime']>['translate']>>
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
    return super.toRepresentation(toRepresentationCallback) as unknown as DatetimeSchema<
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
   * This function is used to transform the value to the internal representation of the schema. This is useful when you
   * want to transform the value to a type that the schema adapter can understand. For example, you might want to
   * transform a string to a date. This is the function you use.
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
    return super.toInternal(toInternalCallback) as unknown as DatetimeSchema<
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
   * you can convert that string to a date here BEFORE the validation. This pretty much transforms the value to a type
   * that the schema adapter can understand.
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
    return super.toValidate(toValidateCallback) as unknown as DatetimeSchema<
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
   * This will allow the value to be a string, it does not validate, it just parses inputs as strings and allows the
   * result to be a string as well.
   *
   * @example
   * ```typescript
   * const schema = datetime().allowString();
   *
   * schema.parse('2021-01-01T00:00:00.000Z') // works
   * ```
   *
   * @returns - The schema instance
   */
  allowString() {
    this.__allowString = true;

    return this as any as DatetimeSchema<
      {
        input: string | TType['input'];
        output: string | TType['output'];
        internal: string | TType['output'];
        representation: string | TType['output'];
        validate: string | TType['output'];
      },
      TDefinitions
    >;
  }

  /**
   * This will validate if the value is above the specified date.
   *
   * @example
   * ```ts
   * const today = new Date();
   * const yesterday = new Date(today);
   * yesterday.setDate(today.getDate() - 1);
   *
   * datetime().above(today).parse(today) // throws error
   * datetime().above(today, { inclusive: true }).parse(today) // works
   * datetime().above(yesterday).parse(today) // works
   * ```
   *
   * @param value - The value that we are comparing against.
   * @param options - The options that we are passing to the validator.
   * @param options.inclusive - If the value is inclusive or not. In other words, if the value can be equal to
   * the specified date.
   * @param options.message - The message that we are returning if the value is not above the specified date.
   *
   * @returns - The schema instance
   */
  above(value: Date, options?: { inclusive?: boolean; message: string }) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options.inclusive : false;
    const message = options?.message || 'Value is not above the specified date';

    this.__above = {
      value,
      inclusive,
      message
    };
    return this;
  }

  /**
   * This will validate if the value is below the specified date.
   *
   * @example
   * ```ts
   * const today = new Date();
   * const yesterday = new Date(today);
   * yesterday.setDate(today.getDate() - 1);
   *
   * datetime().below(today).parse(today) // throws error
   * datetime().below(today, { inclusive: true }).parse(today) // works
   * datetime().below(today).parse(yesterday) // works
   * ```
   *
   * @param value - The value that we are comparing against.
   * @param options - The options that we are passing to the validator.
   * @param options.inclusive - If the value is inclusive or not. In other words, if the value can be equal to the
   * specified date.
   * @param options.message - The message that we are returning if the value is not above the specified date.
   *
   * @returns - The schema instance
   */
  below(value: Date, options?: { inclusive?: boolean; message: string }) {
    const inclusive = typeof options?.inclusive === 'boolean' ? options.inclusive : false;
    const message = options?.message || 'Value is not below the specified date';

    this.__below = {
      value,
      inclusive,
      message
    };
    return this;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType>() {
    const returnValue = new DatetimeSchema<
      {
        input: Date;
        validate: Date;
        internal: Date;
        output: Date;
        representation: Date;
      },
      TDefinitions
    >();

    return returnValue;
  }
}

export const datetime = <TDefinitions extends DefinitionsOfSchemaType>() => DatetimeSchema.new<TDefinitions>();
