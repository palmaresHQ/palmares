import { utils } from '@palmares/core';

import {
  ON_DELETE,
  ClassConstructor,
  FieldDefaultParamsType,
  DateFieldParamsType,
  DecimalFieldParamsType,
  CharFieldParamsType,
  TextFieldParamsType,
  ForeignKeyFieldParamsType,
  UUIDFieldParamsType,
  CustomImportsForFieldType,
} from './types';
import Engine, { EngineFields } from '../../engine';
import { ForeignKeyFieldRequiredParamsMissingError } from './exceptions';
import { TModel } from '../types';
import { generateUUID } from '../../utils';

export { ON_DELETE as ON_DELETE };

export class Field<
  D = any,
  N extends boolean = boolean,
  U extends boolean = boolean
> {
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
  customAttributes: any | undefined | object | null;
  model!: TModel;
  fieldName!: string;

  constructor({
    primaryKey = false,
    defaultValue = undefined,
    allowNull = false,
    unique = false,
    dbIndex = false,
    databaseName = null,
    underscored = true,
    customAttributes = {},
  }: {
    defaultValue?: D;
    allowNull?: N extends true ? boolean : boolean;
  } & FieldDefaultParamsType = {}) {
    this.primaryKey = primaryKey;
    this.defaultValue = defaultValue;
    this.allowNull = allowNull as N;
    this.unique = unique as U;
    this.dbIndex = dbIndex;
    this.databaseName = databaseName || '';
    this.underscored = underscored;
    this.customAttributes = customAttributes;
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
      `${ident}models.fields.${this.constructor.name}.new({` +
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

/**
 * This is similar to an Integer Field except that it is the `id` of the database.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class AutoField<
  D extends number = 1,
  N extends boolean = false
> extends Field<D, N> {
  type!: number;
  typeName: string = AutoField.name;

  constructor({
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & FieldDefaultParamsType = {}) {
    super({
      ...rest,
      primaryKey: true,
      allowNull: false,
      unique: true,
      dbIndex: true,
    });
  }
}

/**
 * Same as the `AutoField` except that this is a big integer field so it accepts bigger numbers.
 * By default it is an auto-incrementing integer field, it is the primary key and it is unique.
 */
export class BigAutoField<
  D extends number = 1,
  N extends boolean = false
> extends Field<D, N> {
  type!: number;
  typeName: string = BigAutoField.name;

  constructor({
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & FieldDefaultParamsType = {}) {
    super({
      ...rest,
      primaryKey: true,
      allowNull: false,
      unique: true,
      dbIndex: true,
    });
  }
}

export class IntegerField<
  D extends number | undefined = undefined,
  N extends boolean = false
> extends Field<D, N> {
  type!: number;
  typeName: string = IntegerField.name;

  constructor(
    integerFieldParams: {
      defaultValue?: D;
      allowNull?: N;
    } & FieldDefaultParamsType = {}
  ) {
    super({ ...integerFieldParams });
    const isDefaultValueDefined: boolean =
      typeof integerFieldParams.defaultValue === 'number' ||
      integerFieldParams.defaultValue === null;
    this.defaultValue = isDefaultValueDefined
      ? integerFieldParams.defaultValue
      : undefined;
  }
}

export class BigIntegerField<
  D extends number | undefined = undefined,
  N extends boolean = false
> extends Field<D, N> {
  type!: number;
  typeName: string = BigIntegerField.name;

  constructor(
    bigIntegerFieldParams: {
      defaultValue?: D;
      allowNull?: N;
    } & FieldDefaultParamsType = {}
  ) {
    super({ ...bigIntegerFieldParams });
    const isDefaultValueDefined: boolean =
      typeof bigIntegerFieldParams.defaultValue === 'number' ||
      bigIntegerFieldParams.defaultValue === null;
    this.defaultValue = isDefaultValueDefined
      ? bigIntegerFieldParams.defaultValue
      : undefined;
  }
}

export class DecimalField<
  D extends number | undefined = undefined,
  N extends boolean = false
> extends Field<D, N> {
  type!: number;
  typeName: string = DecimalField.name;
  maxDigits?: number;
  decimalPlaces?: number;

  constructor({
    maxDigits = undefined,
    decimalPlaces = undefined,
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & DecimalFieldParamsType = {}) {
    super({ ...rest });
    const isDefaultValueDefined: boolean =
      typeof rest.defaultValue === 'number' || rest.defaultValue === null;
    this.defaultValue = isDefaultValueDefined ? rest.defaultValue : undefined;
    this.maxDigits = maxDigits;
    this.decimalPlaces = decimalPlaces;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async toString(indentation = 0, _ = '') {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}maxDigits: ${this.maxDigits},\n` +
        `${ident}decimalPlaces: ${this.decimalPlaces}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsDecimal = field as DecimalField;
    return (
      (await super.compare(field)) &&
      fieldAsDecimal.maxDigits === this.maxDigits &&
      fieldAsDecimal.decimalPlaces === this.decimalPlaces
    );
  }
}

export class TextField<
    D extends string | undefined = undefined,
    N extends boolean = false
  >
  extends Field<D, N>
  implements TextFieldParamsType
{
  type!: string;
  typeName: string = TextField.name;
  allowBlank: boolean;

  constructor({
    allowBlank = true,
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & TextFieldParamsType = {}) {
    super({ ...rest });
    const isDefaultValueDefined: boolean =
      rest.defaultValue === 'string' || rest.defaultValue === null;
    this.defaultValue = isDefaultValueDefined ? rest.defaultValue : undefined;
    this.allowBlank = allowBlank;
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(
      indentation,
      `${ident}allowBlank: ${this.allowBlank},` + customParamsString
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsText = field as TextField;
    return (
      (await super.compare(field)) && fieldAsText.allowBlank === this.allowBlank
    );
  }
}

export class CharField<
    D extends string | undefined = undefined,
    N extends boolean = false
  >
  extends TextField<D, N>
  implements CharFieldParamsType
{
  hasDefaultValue!: D extends undefined ? false : true;
  type!: string;
  typeName: string = CharField.name;
  maxLength: number;

  constructor(
    {
      maxLength = 255,
      allowBlank = true,
      ...rest
    }: {
      defaultValue?: D;
      allowNull?: N;
    } & CharFieldParamsType = {} as any
  ) {
    super({
      allowBlank: typeof allowBlank === 'boolean' ? allowBlank : true,
      ...rest,
    });
    const defaultValueAsString = rest?.defaultValue as string;
    const isDefaultValueDefined: boolean =
      (defaultValueAsString === 'string' &&
        defaultValueAsString.length <= maxLength) ||
      defaultValueAsString === null;
    this.defaultValue = isDefaultValueDefined ? rest.defaultValue : undefined;
    this.maxLength = maxLength;
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(
      indentation,
      `${ident}maxLength: ${this.maxLength},` + `${customParamsString}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsText = field as CharField;
    return (
      (await super.compare(field)) && fieldAsText.maxLength === this.maxLength
    );
  }
}

export class UUIDField<
    D extends string | undefined = undefined,
    N extends boolean = false
  >
  extends CharField<D, N>
  implements UUIDFieldParamsType
{
  type!: string;
  typeName: string = UUIDField.name;
  autoGenerate: boolean;

  constructor(
    {
      autoGenerate = false,
      maxLength = 36,
      ...rest
    }: {
      defaultValue?: D;
      allowNull?: N;
    } & UUIDFieldParamsType = {} as any
  ) {
    super({
      maxLength: typeof maxLength === 'number' ? maxLength : 36,
      defaultValue: (autoGenerate ? '' : rest.defaultValue) as D,
      ...rest,
    });
    this.autoGenerate = autoGenerate;
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(
      indentation,
      `${ident}autoGenerate: ${this.autoGenerate},${customParamsString}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsUUID = field as UUIDField;
    return (
      (await super.compare(field)) &&
      fieldAsUUID.autoGenerate === this.autoGenerate
    );
  }
}

/**
 * This field is used to hold only date values, not time, just dates.
 */
export class DateField<
    D extends string | Date | undefined = undefined,
    N extends boolean = false
  >
  extends Field<D, N>
  implements DateFieldParamsType
{
  type!: Date;
  typeName: string = DateField.name;
  autoNow: boolean;
  autoNowAdd: boolean;

  constructor({
    autoNow = false,
    autoNowAdd = false,
    ...rest
  }: {
    defaultValue?: D;
    allowNull?: N;
  } & DateFieldParamsType = {}) {
    super({ ...rest });
    this.autoNow = autoNow;
    this.autoNowAdd = autoNowAdd;
  }

  async toString(
    indentation = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}autoNow: ${this.autoNow},\n${ident}autoNowAdd: ${this.autoNowAdd}`
    );
  }

  async compare(field: Field<any, boolean>): Promise<boolean> {
    const fieldAsDate = field as DateField;
    return (
      (await super.compare(field)) &&
      fieldAsDate.autoNow === this.autoNow &&
      fieldAsDate.autoNowAdd === this.autoNowAdd
    );
  }
}

/**
 * This type of field is special and is supposed to hold foreign key references to another field of another model.
 * Usually in relational databases like postgres we can have related fields like `user_id` inside of the table `posts`.
 * What this means that each value in the column `user_id` is one of the ids of the `users` table. This means that we
 * can use this value to join them together.
 */
export class ForeignKeyField<
  T = undefined,
  M extends TModel = TModel,
  F extends string = any,
  D extends
    | (T extends undefined ? M['fields'][F]['type'] : T)
    | undefined = undefined,
  N extends boolean = boolean,
  U extends boolean = boolean,
  RN extends string = any,
  RNN extends string = any
> extends Field<D, N, U> {
  type!: T extends undefined ? M['fields'][F]['type'] : T;
  typeName: string = ForeignKeyField.name;
  relatedTo!: string;
  onDelete!: ON_DELETE;
  customName?: string;
  toField: F;
  relationName: RNN;
  _originalRelatedName?: string;

  constructor({
    relatedTo,
    toField,
    onDelete,
    customName,
    relatedName,
    relationName,
    ...rest
  }: {
    relatedTo: ClassConstructor<M> | string;
    toField: F;
    relatedName: RN;
    relationName: RNN;
    unique?: U;
    defaultValue?: D;
    allowNull?: N;
  } & ForeignKeyFieldParamsType) {
    super(rest);

    let relatedToAsString: string = relatedTo as string;
    const isRelatedToNotAString: boolean = typeof relatedTo !== 'string';
    if (isRelatedToNotAString) {
      relatedToAsString = (relatedTo as ClassConstructor<TModel>).name;
    }

    const isRelationNameDefined = typeof relationName === 'string';
    if (isRelationNameDefined) {
      this.relationName = relationName as RNN;
    } else {
      this.relationName = (relatedToAsString.charAt(0).toLowerCase() +
        relatedToAsString.slice(1)) as RNN;
    }
    this.relatedTo = relatedToAsString;
    this.customName = customName;
    this._originalRelatedName = relatedName;
    this.onDelete = onDelete;
    this.toField = toField;
  }

  async init(
    fieldName: string,
    model: TModel,
    engineInstance?: Engine
  ): Promise<void> {
    const isRelatedToAndOnDeleteNotDefined =
      typeof this.relatedTo !== 'string' && typeof this.onDelete !== 'string';

    if (isRelatedToAndOnDeleteNotDefined)
      throw new ForeignKeyFieldRequiredParamsMissingError(this.fieldName);

    // Appends to the model the other models this model is related to.
    model._dependentOnModels.push(this.relatedTo);

    await super.init(fieldName, model, engineInstance);

    const wasRelatedNameDefined: boolean = typeof this.relatedName === 'string';

    if (wasRelatedNameDefined === false) {
      const relatedToWithFirstStringLower: string =
        this.relatedTo.charAt(0).toLowerCase() + this.relatedTo.slice(1);
      const originalModelNameWithFirstStringUpper: string =
        model.originalName.charAt(0).toUpperCase() +
        model.originalName.slice(1);
      this._originalRelatedName = `${relatedToWithFirstStringLower}${originalModelNameWithFirstStringUpper}s`;
    }
  }

  /**
   * This is needed for the state. Some ORMs cannot have the same relatedName twice. What happens is that when recreating the state
   * we repeat the models from the database. By doing it this way we able to create a random relatedName so we guarantee that the same related name will not be
   * used twice inside inside of the engine to two different models.
   *
   * This is a logic that should live here and not on the engine itself because the engine should not be aware of such errors that might occur. We just want
   * to keep it simple to develop engines.
   *
   * @return - Returns a random relatedName if it is a state model, otherwise returns the normal related name.
   */
  get relatedName() {
    const isModelDefined = this.model !== undefined;
    const isModelAStateModel = isModelDefined && this.model._isState === true;
    if (isModelAStateModel)
      return `${generateUUID()}-${this._originalRelatedName}`;
    else return this._originalRelatedName;
  }

  async toString(
    indentation = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}relatedTo: "${this.relatedTo}",\n` +
        `${ident}toField: "${this.toField}",\n` +
        `${ident}onDelete: models.fields.ON_DELETE.${this.onDelete.toUpperCase()},\n` +
        `${ident}customName: ${
          typeof this.customName === 'string'
            ? `"${this.customName}"`
            : this.customName
        },\n` +
        `${ident}relatedName: ${
          typeof this._originalRelatedName === 'string'
            ? `"${this._originalRelatedName}",`
            : this._originalRelatedName
        }`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsForeignKey = field as ForeignKeyField;
    return (
      (await super.compare(field)) &&
      fieldAsForeignKey._originalRelatedName === this._originalRelatedName &&
      fieldAsForeignKey.relatedTo === this.relatedTo &&
      fieldAsForeignKey.toField === this.toField &&
      fieldAsForeignKey.onDelete === this.onDelete &&
      fieldAsForeignKey.customName === this.customName
    );
  }
}

/**
 * Enables developers to create custom fields while also being able to translate them dynamically for a specific engine.
 * Engines might solve the most common issues but they might not support all fields out of the box so you use this field
 * to support the field you are looking to.
 */
export class TranslatableField extends Field {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async translate(engine: Engine, engineFields: EngineFields): Promise<any> {
    return undefined;
  }
}
