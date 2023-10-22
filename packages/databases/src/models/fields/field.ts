import { utils } from '@palmares/core';

import { FieldDefaultParamsType, CustomImportsForFieldType, MaybeNull } from './types';
import Engine from '../../engine';

import type { This } from '../../types';
import type { ModelType } from '../types';
import { BaseModel, Model } from '../model';

/**
 * This is the default field of the model, every other field type should override this one but this one SHOULDN't be called directly.
 * Generally we do not offer any translation to this type of field.
 */
export default class Field<
  TType extends { input: any; output: any } = { input: any; output: any },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> {
  isAuto!: TAuto;
  hasDefaultValue!: TDefaultValue extends undefined ? false : true;
  _type!: TType;
  primaryKey: boolean;
  defaultValue?: TDefaultValue;
  allowNull: TNull;
  unique: TUnique;
  dbIndex: boolean;
  databaseName: TDatabaseName;
  underscored: boolean;
  typeName: string = Field.name;
  customAttributes: TCustomAttributes;
  model!: ModelType;
  fieldName!: string;

  constructor(
    params: FieldDefaultParamsType<TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> = {}
  ) {
    this.primaryKey = typeof params.primaryKey === 'boolean' ? params.primaryKey : false;
    this.defaultValue = params.defaultValue as TDefaultValue;
    this.allowNull = typeof params.allowNull === 'boolean' ? params.allowNull : (false as TNull);
    this.unique = typeof params.unique === 'boolean' ? params.unique : (false as TUnique);
    this.isAuto = typeof params.isAuto === 'boolean' ? params.isAuto : (false as TAuto);
    this.dbIndex = typeof params.dbIndex === 'boolean' ? params.dbIndex : false;
    this.databaseName = params.databaseName || ('' as TDatabaseName);
    this.underscored = params.underscored || false;
    this.customAttributes = params.customAttributes || ({} as TCustomAttributes);
  }

  static new<
    TFieldInstance extends This<typeof Field>,
    TDefaultValue extends TNull extends true
      ? InstanceType<TFieldInstance>['_type']['input'] | undefined | null
      : InstanceType<TFieldInstance>['_type']['input'] | undefined = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
  >(
    params: FieldDefaultParamsType<
      InstanceType<TFieldInstance>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    > = {}
  ) {
    return new this(params) as Field<
      { input: any; output: any },
      InstanceType<TFieldInstance>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes
    >;
  }

  /**
   * This method can be used to override the type of a field. This is useful for library maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the user want to use.
   *
   * @example
   * ```ts
   * const MyCustomDatabaseAutoField = AutoField.overrideType<{ input: string; output: string }>();
   *
   * // then the user can use as normal:
   *
   * const autoField = MyCustomDatabaseAutoField.new();
   *
   * // now the type inferred for the field will be a string instead of a number.
   * ```
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<TNewType extends { input: any; output: any }>() {
    return this as unknown as {
      new: <
        TDefaultValue extends MaybeNull<Field['_type']['input'] | undefined, TNull> = undefined,
        TUnique extends boolean = false,
        TNull extends boolean = false,
        TAuto extends boolean = false,
        TDatabaseName extends string | null | undefined = undefined,
        TCustomAttributes = any,
      >(
        params?: FieldDefaultParamsType<Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>
      ) => Field<TNewType, Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }

  /**
   * This method enables the framework to automatically import the files when generating the migrations.
   *
   * This is generally useful for custom field types.
   *
   * @return - Returns a list of packages that we want to import in the migration file.
   */
  async customImports(): Promise<CustomImportsForFieldType[]> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(fieldName: string, model: ModelType) {
    const isAlreadyInitialized = this.model !== undefined && typeof this.fieldName === 'string';
    if (isAlreadyInitialized) return;

    const modelInstance = new model() as Model & BaseModel;
    const isUnderscored: boolean = (this.underscored || model._options()?.underscored) === true;
    this.fieldName = fieldName;
    this.model = model;

    if (this.primaryKey) model.primaryKeys.push(this.fieldName);
    if (isUnderscored) this.databaseName = utils.camelCaseToHyphenOrSnakeCase(this.fieldName) as TDatabaseName;
    else this.databaseName = this.fieldName as TDatabaseName;
  }

  async toString(indentation = 0, customParams: string | undefined = undefined): Promise<string> {
    const ident = '  '.repeat(indentation);
    const fieldParamsIdent = '  '.repeat(indentation + 1);
    return (
      `${ident}models.fields.${this.constructor.name}.new({` +
      `${customParams ? `\n${customParams}` : ''}\n` +
      `${fieldParamsIdent}primaryKey: ${this.primaryKey},\n` +
      `${fieldParamsIdent}defaultValue: ${JSON.stringify(this.defaultValue)},\n` +
      `${fieldParamsIdent}allowNull: ${this.allowNull},\n` +
      `${fieldParamsIdent}unique: ${this.unique},\n` +
      `${fieldParamsIdent}dbIndex: ${this.dbIndex},\n` +
      `${fieldParamsIdent}databaseName: "${this.databaseName}",\n` +
      `${fieldParamsIdent}underscored: ${this.underscored},\n` +
      `${fieldParamsIdent}customAttributes: ${JSON.stringify(this.customAttributes)}\n` +
      `${ident}})`
    );
  }

  /**
   * Used for comparing one field with the other so we are able to tell if they are different or not.
   *
   * This is obligatory to add if you create any custom fields.
   *
   * For custom fields you will call this super method before continuing, we first check if they are the same type.
   *
   * @param field - The field to compare to.
   *
   * @return - Returns true if the fields are equal and false otherwise
   */
  async compare(field: Field): Promise<boolean> {
    return (
      field.typeName === this.typeName &&
      field.allowNull === this.allowNull &&
      JSON.stringify(field.customAttributes) === JSON.stringify(this.customAttributes) &&
      field.primaryKey === this.primaryKey &&
      field.defaultValue === this.defaultValue &&
      field.unique === this.unique &&
      field.dbIndex === this.dbIndex &&
      field.databaseName === this.databaseName &&
      field.underscored === this.underscored
    );
  }

  /**
   * Gets the options passed on the constructor of the field so that we are able to clone it to a new field.
   *
   * @param field - The field to get the options from. If not provided it will use the current field.
   *
   * @returns - Returns the options passed on the constructor of the field.
   */
  async constructorOptions(field?: Field) {
    if (!field) field = this as Field;
    return {
      allowNull: field.allowNull,
      customAttributes: field.customAttributes,
      defaultValue: field.defaultValue,
      dbIndex: field.dbIndex,
      databaseName: field.databaseName,
      isAuto: field.isAuto,
      primaryKey: field.primaryKey,
      underscored: field.underscored,
      unique: field.unique,
    };
  }

  /**
   * Used for cloning the field to a new field.
   *
   * @param field - The field to clone. If not provided it will use the current field.
   *
   * @returns - Returns the cloned field.
   */
  async clone(field?: Field): Promise<Field> {
    if (!field) field = this as Field;
    const constructorOptions = await this.constructorOptions(field);
    return (field.constructor as typeof Field).new(constructorOptions);
  }
}

/**
 * Used internally so we can override the internal behavior of Field when extending this field.
 *
 * **THIS SHOULD NOT BE USED DIRECTLY. IT DOES NOT OFFER ANY REAL FUNCTIONALITY, TYPESCRIPT ONLY.**
 */
export class UnopinionatedField<
  TType extends { input: any; output: any } = { input: any; output: any },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<TField['_type']['input'] | undefined, TNull> = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
> extends Field<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  constructor(params: any) {
    super(params);
  }

  static overrideType<TNewType extends { input: any; output: any }>() {
    return this as unknown as {
      new: <
        TDefaultValue extends MaybeNull<Field['_type']['input'] | undefined, TNull> = undefined,
        TUnique extends boolean = false,
        TNull extends boolean = false,
        TAuto extends boolean = false,
        TDatabaseName extends string | null | undefined = undefined,
        TCustomAttributes = any,
      >(
        params?: any
      ) => UnopinionatedField<TNewType, Field, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes>;
    };
  }
}
