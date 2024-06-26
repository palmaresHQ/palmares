import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import { defaultTransform, defaultTransformToAdapter } from '../utils';
import { DefinitionsOfSchemaType } from './types';
import { optional, nullable, is } from '../validators/schema';
import { booleanValidation } from '../validators/boolean';
import convertFromStringBuilder from '../parsers/convert-from-string';

export default class BooleanSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    output: any;
    representation: any;
  } = {
    input: boolean;
    output: boolean;
    internal: boolean;
    representation: boolean;
    validate: boolean;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
> extends Schema<TType, TDefinitions> {
  protected __allowString!: boolean;
  protected __allowNumber!: boolean;
  protected __trueValues!: any[];
  protected __falseValues!: any[];

  protected __is!: {
    value: boolean;
    message: string;
  };

  protected async __transformToAdapter(options: Parameters<Schema['__transformToAdapter']>[0]): Promise<any> {
    return defaultTransformToAdapter(
      async (adapter) => {
        return defaultTransform(
          'boolean',
          this,
          adapter,
          adapter.boolean,
          () => ({
            parsers: {
              allowString: this.__allowString,
              allowNumber: this.__allowNumber,
              is: this.__is?.value,
              trueValues: this.__trueValues,
              falseValues: this.__falseValues,
              nullable: this.__nullable.allow,
              optional: this.__optional.allow,
            },
            is: this.__is,
            nullable: this.__nullable,
            optional: this.__optional,
          }),
          {

            optional,
            nullable,
            is,
          },
          {
            validatorsIfFallbackOrNotSupported: booleanValidation(),
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => [],
          }
        );
      },
      this.__transformedSchemas,
      options,
      'boolean'
    );
  }

  /**
   * This let's you refine the schema with custom validations. This is useful when you want to validate something that is not supported by default by the schema adapter.
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
   * console.log(errors); // [{ isValid: false, code: 'invalid_number', message: 'The number should be greater than 0', path: [] }]
   * ```
   *
   * @param refinementCallback - The callback that will be called to validate the value.
   * @param options - Options for the refinement.
   * @param options.isAsync - Whether the callback is async or not. Defaults to true.
   *
   * @returns The schema.
   */
  refine(
    refinementCallback: (value: TType['input']) => Promise<void | undefined | { code: string; message: string }> | void | undefined | { code: string; message: string }
  ) {
    return super.refine(refinementCallback) as unknown as BooleanSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      }, TDefinitions
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
    return super.optional(options) as unknown as BooleanSchema<
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
   * Allows the value to be null and ONLY null. You can also use this function to set a custom message when the value is NULL by setting
   * the { message: 'Your custom message', allow: false } on the options.
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
    return super.nullable(options) as unknown as BooleanSchema<
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
   * This method will remove the value from the representation of the schema. If the value is undefined it will keep that way
   * otherwise it will set the value to undefined after it's validated.
   * This is used in conjunction with the {@link data} function, the {@link parse} function or {@link validate}
   * function. This will remove the value from the representation of the schema.
   *
   * By default, the value will be removed just from the representation, in other words, when you call the {@link data} function.
   * But if you want to remove the value from the internal representation, you can pass the argument `toInternal` as true.
   * Then if you still want to remove the value from the representation, you will need to pass the argument `toRepresentation` as true as well.
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
   * @param args - By default, the value will be removed just from the representation, in other words, when you call the {@link data} function.
   * But if you want to remove the value from the internal representation, you can pass the argument `toInternal` as true.
   * Then if you still want to remove the value from the representation, you will need to pass the argument `toRepresentation` as true as well.
   *
   * @returns The schema.
   */
  omit<
    TToInternal extends boolean,
    TToRepresentation extends boolean = boolean extends TToInternal ? true : false
  >(args?: { toInternal?: TToInternal, toRepresentation?: TToRepresentation }) {
    return super.omit(args) as unknown as BooleanSchema<
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
   * This function is used in conjunction with the {@link validate} function. It's used to save a value to an external source
   * like a database. You should always return the schema after you save the value, that way we will always have the correct type
   * of the schema after the save operation.
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
    return super.onSave(callback) as unknown as BooleanSchema<
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
   * This function is used to add a default value to the schema. If the value is either undefined or null, the default value will be used.
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
    return super.default(defaultValueOrFunction) as unknown as BooleanSchema<
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
   * This function let's you customize the schema your own way. After we translate the schema on the adapter we call this function to let you customize
   * the custom schema your own way. Our API does not support passthrough? No problem, you can use this function to customize the zod schema.
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
   * console.log(errors); // [{ isValid: false, code: 'nonnegative', message: 'The number should be nonnegative', path: [] }]
   * ```
   *
   * @param callback - The callback that will be called to customize the schema.
   * @param toStringCallback - The callback that will be called to transform the schema to a string when you want to compile the underlying schema
   * to a string so you can save it for future runs.
   *
   * @returns The schema.
   */
  extends(
    callback: (
      schema: Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['datetime']>['translate']>>
    ) => Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['field']>['translate']>> | any,
    toStringCallback?: (schemaAsString: string) => string
  ) {
    return super.extends(callback, toStringCallback) as this;
  }

  /**
   * This function is used to transform the value to the representation of the schema. When using the {@link data} function. With this function you have full
   * control to add data cleaning for example, transforming the data and whatever. Another use case is when you want to return deeply nested recursive data.
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
    return super.toRepresentation(toRepresentationCallback) as unknown as BooleanSchema<
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
   * This function is used to transform the value to the internal representation of the schema. This is useful when you want to transform the value
   * to a type that the schema adapter can understand. For example, you might want to transform a string to a date. This is the function you use.
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
    return super.toInternal(toInternalCallback) as unknown as BooleanSchema<
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
   * Called before the validation of the schema. Let's say that you want to validate a date that might receive a string, you can convert that string to a date
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
    return super.toValidate(toValidateCallback) as unknown as BooleanSchema<
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
   * This will allow the value to be a string, it does not validate, it just parses inputs as strings and allows the result to be a string as well.
   *
   * @example
   * ```ts
   * boolean().allowString().parse('true') // true
   * ```
   *
   * @returns - The schema instance
   */
  allowString() {
    this.__allowString = true;

    this.__parsers.low.set(
      'allowString',
      convertFromStringBuilder((value) => {
        return {
          value: Boolean(value),
          preventNextParsers: false,
        };
      })
    );

    return this as any as BooleanSchema<
      {
        input: string | TType['input'];
        output: string | TType['output'];
        internal: string | TType['internal'];
        representation: string | TType['representation'];
        validate: string | TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * Allows you to set the values that will be considered as true. This is useful when you have a string that can be 'T' or 'F' for example.
   *
   * @example
   * ```ts
   * boolean().trueValues(['T', 'Y', 1]).parse('T') // works and parses to true
   * boolean().trueValues(['T', 'Y', 1]).parse('N') // fails
   * ```
   *
   * @param values - The values on an array that will be considered as true.
   *
   * @returns - The schema instance
   */
  trueValues<const TValues extends any[]>(values: TValues) {
    this.__trueValues = values;

    this.__parsers.medium.set('trueValues', (value) => {
      const valueExistsInList = values.includes(value);
      return {
        preventNextParsers: valueExistsInList,
        value: valueExistsInList,
      };
    });
    return this as any as BooleanSchema<
      {
        input: TValues[number] | TType['input'];
        output: TValues[number] | TType['output'];
        internal: TValues[number] | TType['internal'];
        representation: TValues[number] | TType['representation'];
        validate: TValues[number] | TType['validate'];
      },
      TDefinitions
    >;
  }

    /**
   * Allows you to set the values that will be considered as false. This is useful when you have a string that can be 'N' or 0 for example.
   *
   * @example
   * ```ts
   * boolean().falseValues(['F', 'N', 0]).parse('F') // works and parses to false
   * boolean().falseValues(['F', 'N', 0]).parse('Y') // fails and returns the value as is
   * ```
   *
   * @param values - The values on an array that will be considered as true.
   *
   * @returns - The schema instance
   */
  falseValues<const TValues extends any[]>(values: TValues) {
    this.__falseValues = values;

    this.__parsers.medium.set('falseValues', (value) => {
      const valueExistsInList = values.includes(value);
      return {
        preventNextParsers: valueExistsInList,
        value: !valueExistsInList,
      };
    });

    return this as any as BooleanSchema<
      {
        input: TValues[number] | TType['input'];
        output: TValues[number] | TType['output'];
        internal: TValues[number] | TType['internal'];
        representation: TValues[number] | TType['representation'];
        validate: TValues[number] | TType['validate'];
      },
      TDefinitions
    >;
  }

  /**
   * This will allow the value to be a number, it does not validate, it just parses inputs as number and allows the result to be a string as well.
   *
   * @example
   * ```ts
   * boolean().allowNumber().parse(1) // true
   * ```
   *
   * @returns - The schema instance
   */
  allowNumber() {
    this.__allowNumber = true;

    this.__parsers.low.set('allowNumber', (value) => {
      return {
        value: typeof value === 'number' ? Boolean(value) : value,
        preventNextParsers: typeof value === 'number',
      };
    });

    return this as any as BooleanSchema<
      {
        input: number | TType['input'];
        output: number | TType['output'];
        internal: number | TType['output'];
        representation: number | TType['output'];
        validate: number | TType['output'];
      },
      TDefinitions
    >;
  }

  /**
   * This will validate if the value is equal to the value passed as argument. This way you can guarantee that the value
   * is exactly what you want.
   *
   * @example
   * ```ts
   * boolean().is(true).parse(true) // true
   * boolean().is(true).parse(false) // doesn't allow
   * ```
   *
   * @param value - The value to compare with
   * @param options - The options to be passed to the validation
   * @param options.message - The message to be returned if the validation fails
   *
   * @returns - The schema instance
   */
  is<TValue extends true | false>(value: TValue, options?: { message?: string }) {
    this.__is = {
      value,
      message: typeof options?.message === 'string' ? options?.message : `The value should be equal to ${value}`,
    };

    this.__parsers.high.set('is', (valueFromParser) => {
      const isSetValue = value === valueFromParser;
      return {
        value: isSetValue ? valueFromParser : undefined,
        preventNextParsers: true,
      };
    });

    return this as any as Schema<
      {
        input: TValue extends true ? true : false;
        output: TValue extends true ? true : false;
        internal: TValue extends true ? true : false;
        representation: TValue extends true ? true : false;
        validate: TValue extends true ? true : false;
      },
      TDefinitions
    >;
  }

  static new<TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType>() {
    const returnValue = new BooleanSchema<
      {
        input: boolean;
        validate: boolean;
        internal: boolean;
        output: boolean;
        representation: boolean;
      },
      TDefinitions
    >();

    const adapterInstance = getDefaultAdapter();

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: [],
    };

    return returnValue;
  }
}

export const boolean = <TDefinitions extends DefinitionsOfSchemaType>() => BooleanSchema.new<TDefinitions>();
