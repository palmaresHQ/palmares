import TextField from './text';
import Field from './field';

import type { This } from '../../types';
import type { MaybeNull, UUIDFieldParamsType } from './types';

/**
 * Functional approach for the creation of a UuidField.
 *
 * A UuidField is used to store UUID values.
 *
 * @example
 * ```ts
 * const uuidField = uuid();
 * ```
 *
 * @example
 * ```
 * const uuidField = uuid({ defaultValue: `9962b833-f2ac-4ce4-914c-8eee93e14772` });
 * ```
 */
export function uuid<
  TDefaultValue extends MaybeNull<UuidField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TAutoGenerate extends boolean = false,
>(
  params: UUIDFieldParamsType<
    UuidField,
    TDefaultValue,
    TUnique,
    TNull,
    TAutoGenerate extends true ? true : TAuto,
    TDatabaseName,
    TCustomAttributes
  > = {}
) {
  return UuidField.new(params);
}

/**
 * A UuidField is used to store UUID values.
 *
 * @example
 * ```ts
 * const uuidField = UuidField.new();
 * ```
 *
 * @example
 * ```
 * const uuidField = UuidField.new({ defaultValue: `9962b833-f2ac-4ce4-914c-8eee93e14772` });
 * ```
 */
export default class UuidField<
  TType extends { input: string; output: string } = { input: string; output: string },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TAutoGenerate extends boolean = false,
> extends TextField<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  typeName: string = UuidField.name;
  autoGenerate: TAutoGenerate;

  constructor(
    params: UUIDFieldParamsType<
      TField,
      TDefaultValue,
      TUnique,
      TNull,
      TAutoGenerate extends true ? true : TAuto,
      TDatabaseName,
      TCustomAttributes,
      TAutoGenerate
    >
  ) {
    super({
      isAuto: (typeof params.autoGenerate === 'boolean' ? params.autoGenerate : false) as any,
      ...params,
    });
    this.autoGenerate = typeof params.autoGenerate === 'boolean' ? params.autoGenerate : (false as TAutoGenerate);
  }

  static new<
    TField extends This<typeof TextField>,
    TDefaultValue extends MaybeNull<InstanceType<TField>['_type']['input'] | undefined, TNull> = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
    TAutoGenerate extends boolean = false,
  >(
    this: TField,
    params: UUIDFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TAutoGenerate
    > = {}
  ) {
    return new this(params) as UuidField<
      { input: string; output: string },
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TAutoGenerate
    >;
  }

  /**
   * This is mostly used internally by the engine to stringify the contents of the field on migrations. But you can override this if you want to extend the UuidField class.
   *
   * @example
   * ```
   * class CustomUuidField extends UuidField {
   *   aCustomValue: string;
   *
   *   async toString(indentation = 0, customParams: string | undefined = undefined) {
   *    const ident = '  '.repeat(indentation + 1);
   *    const customParamsString = customParams ? `\n${customParams}` : '';
   *    return super.toString(indentation, `${ident}aCustomValue: ${this.aCustomValue},` + `${customParamsString}`);
   *   }
   * }
   * ```
   *
   * On this example, your custom UuidField instance defines a `aCustomValue` property that will be added on the migrations. It is useful if you have created a custom field and wants to
   * implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation. Use `'  '.repeat(indentation + 1);`
   * @param customParams - Custom parameters to append to the stringified field.
   *
   * @returns The stringified field.
   */
  async toString(indentation = 0, customParams: string | undefined = undefined) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(indentation, `${ident}autoGenerate: ${this.autoGenerate},${customParamsString}`);
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field. You can override this if you want to extend the UuidField class.
   *
   * @example
   * ```
   * class CustomUuidField extends UuidField {
   *   aCustomValue: string;
   *
   *   async compare(field:Field) {
   *      return (await super.compare(field)) && fieldAsText.aCustomValue === this.aCustomValue;
   *   }
   * }
   * ```
   *
   * @param field - The field to compare.
   *
   * @returns A promise that resolves to a boolean indicating if the field is equal to the other field.
   */
  async compare(field: UuidField): Promise<boolean> {
    return (await super.compare(field)) && field.autoGenerate === this.autoGenerate;
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing that you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomUuidField extends UuidField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: UuidField) {
   *   if (!field) field = this as UuidField;
   *   const defaultConstructorOptions = await super.constructorOptions(field);
   *   return {
   *     ...defaultConstructorOptions,
   *     aCustomValue: field.aCustomValue,
   *   };
   * }
   * ```
   *
   * @param field - The field to get the constructor options from. If not provided it will use the current field.
   *
   * @returns The constructor options of the field.
   */
  async constructorOptions(field?: UuidField) {
    if (!field) field = this as UuidField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      autoGenerate: field.autoGenerate,
    };
  }
}
