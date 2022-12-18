import { utils } from '@palmares/core';

import { FieldDefaultParamsType, CustomImportsForFieldType } from './types';
import Engine from '../../engine';
import type { TModel } from '../types';
import type { This } from '../../types';

/**
 * This is the default field of the model, every other field type should override this one but this one SHOULDN't be called directly.
 * Generally we do not offer any translation to this type of field.
 */
export default class Field<
  F extends Field = any,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> {
  isAuto!: A;
  hasDefaultValue!: D extends undefined ? false : true;
  type!: any;
  primaryKey: boolean;
  defaultValue?: D;
  allowNull: N;
  unique: U;
  dbIndex: boolean;
  databaseName: string;
  underscored: boolean;
  typeName: string = Field.name;
  customAttributes: CA;
  model!: TModel;
  fieldName!: string;

  constructor(params: FieldDefaultParamsType<F, D, U, N, A, CA> = {}) {
    this.primaryKey =
      typeof params.primaryKey === 'boolean' ? params.primaryKey : false;
    this.defaultValue = params.defaultValue as D;
    this.allowNull =
      typeof params.allowNull === 'boolean' ? params.allowNull : (false as N);
    this.unique =
      typeof params.unique === 'boolean' ? params.unique : (false as U);
    this.isAuto =
      typeof params.isAuto === 'boolean' ? params.isAuto : (false as A);
    this.dbIndex = typeof params.dbIndex === 'boolean' ? params.dbIndex : false;
    this.databaseName = params.databaseName || '';
    this.underscored = params.underscored || false;
    this.customAttributes = params.customAttributes as CA;
  }

  static new<
    I extends This<typeof Field>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any
  >(params: FieldDefaultParamsType<InstanceType<I>, D, U, N, A, CA> = {}) {
    return new this(params) as Field<InstanceType<I>, D, U, N, A, CA>;
  }

  async init(fieldName: string, model: TModel, engineInstance?: Engine) {
    const isUnderscored: boolean =
      (this.underscored || model.options.underscored) === true;
    this.fieldName = fieldName;
    this.model = model;

    if (isUnderscored)
      this.databaseName = utils.camelCaseToHyphenOrSnakeCase(this.fieldName);
    else this.databaseName = this.fieldName;

    if (engineInstance) await engineInstance.fields.set(this as Field);
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ): Promise<string> {
    const ident = '  '.repeat(indentation);
    const fieldParamsIdent = '  '.repeat(indentation + 1);
    return (
      `${ident}new models.fields.${this.constructor.name}({` +
      `${customParams ? `\n${customParams}` : ''}\n` +
      `${fieldParamsIdent}primaryKey: ${this.primaryKey},\n` +
      `${fieldParamsIdent}defaultValue: ${JSON.stringify(
        this.defaultValue
      )},\n` +
      `${fieldParamsIdent}allowNull: ${this.allowNull},\n` +
      `${fieldParamsIdent}unique: ${this.unique},\n` +
      `${fieldParamsIdent}dbIndex: ${this.dbIndex},\n` +
      `${fieldParamsIdent}databaseName: "${this.databaseName}",\n` +
      `${fieldParamsIdent}underscored: ${this.underscored},\n` +
      `${fieldParamsIdent}customAttributes: ${JSON.stringify(
        this.customAttributes
      )}\n` +
      `${ident}})`
    );
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
      JSON.stringify(field.customAttributes) ===
        JSON.stringify(this.customAttributes) &&
      field.primaryKey === this.primaryKey &&
      field.defaultValue === this.defaultValue &&
      field.unique === this.unique &&
      field.dbIndex === this.dbIndex &&
      field.databaseName === this.databaseName &&
      field.underscored === this.underscored
    );
  }
}
