import Schema from './schema';
import { getDefaultAdapter } from '../conf';
import {
  defaultTransform,
  defaultTransformToAdapter,
  transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas
} from '../utils';
import { unionValidation } from '../validators/union';
import Validator from '../validators/utils';

import type { DefinitionsOfSchemaType } from './types';
import type SchemaAdapter from '../adapter';
import type FieldAdapter from '../adapter/fields';
import type { Narrow } from '@palmares/core';

export default class UnionSchema<
  TType extends {
    input: any;
    validate: any;
    internal: any;
    representation: any;
    output: any;
  } = {
    input: Record<any, any>;
    output: Record<any, any>;
    validate: Record<any, any>;
    internal: Record<any, any>;
    representation: Record<any, any>;
  },
  TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType,
  TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]] = [
    Schema<any, any>,
    Schema<any, any>,
    ...Schema<any, any>[]
  ]
> extends Schema<TType, TDefinitions> {
  protected __schemas = new Set<Schema<any>>();

  constructor(schemas: TSchemas) {
    super();
    this.__schemas = new Set(schemas);
  }

  protected async _transformToAdapter(
    options: Parameters<Schema['__transformToAdapter']>[0]
  ): Promise<ReturnType<FieldAdapter['translate']>> {
    return await defaultTransformToAdapter(
      async (adapter) => {
        const promises: Promise<any>[] = [];
        const shouldBeHighPriorityFallback = adapter.union === undefined;
        const transformedSchemasAsString: string[] = [];
        const transformedSchemas: any[] = [];
        let shouldBeHandledByFallback = shouldBeHighPriorityFallback;

        for (const schemaToTransform of this.__schemas.values()) {
          const awaitableTransformer = async () => {
            const [transformedData, shouldAddFallbackValidationForThisKey] =
              await transformSchemaAndCheckIfShouldBeHandledByFallbackOnComplexSchemas(schemaToTransform, options);
            if (shouldAddFallbackValidationForThisKey) shouldBeHandledByFallback = true;

            for (const transformedSchema of transformedData) {
              transformedSchemasAsString.push(transformedSchema.asString);
              transformedSchemas.push(transformedSchema.transformed);
            }
          };
          promises.push(awaitableTransformer());
        }

        if (shouldBeHandledByFallback) {
          Validator.createAndAppendFallback(
            this,
            unionValidation(
              Array.from(this.__schemas) as unknown as readonly [
                Schema<any, any>,
                Schema<any, any>,
                ...Schema<any, any>[]
              ]
            ),
            {
              at: 0,
              removeCurrent: true
            }
          );
        }

        await Promise.all(promises);
        return defaultTransform(
          'union',
          this,
          adapter,
          adapter.union,
          (isStringVersion) => ({
            nullable: this.__nullable,
            optional: this.__optional,
            schemas: isStringVersion ? transformedSchemasAsString : transformedSchemas,
            parsers: {
              nullable: this.__nullable.allow,
              optional: this.__optional.allow
            }
          }),
          {},
          {
            shouldAddStringVersion: options.shouldAddStringVersion,
            fallbackIfNotSupported: async () => {
              if (options.appendFallbacksBeforeAdapterValidation)
                options.appendFallbacksBeforeAdapterValidation(
                  'union',
                  async (adapter, fieldAdapter, schema, translatedSchemas, value, path, options) => {
                    const parsedValues = {
                      parsed: value,
                      errors: []
                    } as { parsed: any; errors: any[] };
                    // const initialErrorsAsHashedSet = new Set(Array.from(options.errorsAsHashedSet || []));
                    for (const translatedSchema of translatedSchemas) {
                      //options.errorsAsHashedSet = initialErrorsAsHashedSet;
                      const { parsed, errors } = await schema.__validateByAdapter(
                        adapter,
                        fieldAdapter,
                        translatedSchema,
                        value,
                        path,
                        options
                      );

                      // eslint-disable-next-line ts/no-unnecessary-condition
                      if ((errors || []).length <= 0) return { parsed, errors };
                      else {
                        parsedValues.parsed = parsed;
                        // eslint-disable-next-line ts/no-unnecessary-condition
                        parsedValues.errors = (parsedValues.errors || []).concat(errors || []);
                      }
                    }
                    return parsedValues;
                  }
                );

              const transformedSchemasAsPromises = [];
              for (const schema of this.__schemas)
                transformedSchemasAsPromises.push((schema as any).__transformToAdapter(options));

              console.log((await Promise.all(transformedSchemasAsPromises)).flat());
              return (await Promise.all(transformedSchemasAsPromises)).flat();
            }
          }
        );
      },
      this.__transformedSchemas,
      options,
      'union'
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
    return super.refine(refinementCallback) as unknown as UnionSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions,
      TSchemas
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
    return super.optional(options) as unknown as UnionSchema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'] | undefined | null;
        internal: TType['internal'] | undefined | null;
        output: TType['output'] | undefined | null;
        representation: TType['representation'] | undefined | null;
      },
      TDefinitions,
      TSchemas
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
    return super.nullable(options) as unknown as UnionSchema<
      {
        input: TType['input'] | null;
        validate: TType['validate'] | null;
        internal: TType['internal'] | null;
        output: TType['output'] | null;
        representation: TType['representation'] | null;
      },
      TDefinitions,
      TSchemas
    >;
  }

  /**
   * This method will remove the value from the representation of the schema. If the value is undefined it will keep
   * that way
   * otherwise it will set the value to undefined after it's validated.
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
   * the {@link data} function. But if you want to remove the value from the internal representation, you can pass
   * the argument `toInternal` as true. Then if you still want to remove the value from the representation, you
   * will need to pass the argument `toRepresentation` as true as well.
   *
   * @returns The schema.
   */
  omit<
    TToInternal extends boolean,
    TToRepresentation extends boolean = boolean extends TToInternal ? true : false
  >(args?: { toInternal?: TToInternal; toRepresentation?: TToRepresentation }) {
    return super.omit(args) as unknown as UnionSchema<
      {
        input: TToInternal extends true ? TType['input'] | undefined : TType['input'];
        validate: TToInternal extends true ? TType['validate'] | undefined : TType['validate'];
        internal: TToInternal extends true ? undefined : TType['internal'];
        output: TToRepresentation extends true ? TType['output'] | undefined : TType['output'];
        representation: TToRepresentation extends true ? undefined : TType['representation'];
      },
      TDefinitions,
      TSchemas
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
    return super.onSave(callback) as unknown as UnionSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions & {
        hasSave: true;
      },
      TSchemas
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
    return super.default(defaultValueOrFunction) as unknown as UnionSchema<
      {
        input: TType['input'] | undefined | null;
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'] | undefined | null;
        representation: TType['representation'];
      },
      TDefinitions,
      TSchemas
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
   * @param toStringCallback - The callback that will be called to transform the schema to a string when you want
   * to compile the underlying schema to a string so you can save it for future runs.
   *
   * @returns The schema.
   */
  extends(
    callback: (
      schema: Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['union']>['translate']>>
    ) => Awaited<ReturnType<NonNullable<TDefinitions['schemaAdapter']['field']>['translate']>> | any,
    toStringCallback?: (schemaAsString: string) => string
  ) {
    return super.extends(callback, toStringCallback);
  }

  /**
   * This function is used to transform the value to the representation of the schema. When using the {@link data}
   * function. With this function you have full control to add data cleaning for example, transforming the data and
   * whatever. Another use case is when you want to return deeply nested recursive data. The schema maps to itself.
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
    return super.toRepresentation(toRepresentationCallback) as unknown as UnionSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TType['internal'];
        output: TType['output'];
        representation: TRepresentation;
      },
      TDefinitions,
      TSchemas
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
    return super.toInternal(toInternalCallback) as unknown as UnionSchema<
      {
        input: TType['input'];
        validate: TType['validate'];
        internal: TInternal;
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions,
      TSchemas
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
    return super.toValidate(toValidateCallback) as unknown as UnionSchema<
      {
        input: TType['input'];
        validate: TValidate;
        internal: TType['internal'];
        output: TType['output'];
        representation: TType['representation'];
      },
      TDefinitions,
      TSchemas
    >;
  }

  static new<
    TSchemas extends readonly [Schema<any, any>, Schema<any, any>, ...Schema<any, any>[]],
    TDefinitions extends DefinitionsOfSchemaType = DefinitionsOfSchemaType
  >(schemas: Narrow<TSchemas>): UnionSchema<TSchemas[number] extends Schema<infer TType, any> ? TType : never> {
    const returnValue = new UnionSchema<
      TSchemas[number] extends Schema<infer TType, any> ? TType : never,
      TDefinitions,
      TSchemas
    >(schemas as TSchemas);

    const adapterInstance = new Proxy(
      { current: undefined as undefined | SchemaAdapter },
      {
        get: (target, prop) => {
          if (target.current) return (target.current as any)[prop];

          const adapter = getDefaultAdapter();
          target.current = adapter;
          return (target.current as any)[prop];
        }
      }
    ) as unknown as SchemaAdapter;

    returnValue.__transformedSchemas[adapterInstance.constructor.name] = {
      transformed: false,
      adapter: adapterInstance,
      schemas: []
    };
    return returnValue as any;
  }
}

export const union = UnionSchema.new;
