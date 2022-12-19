import {
  ON_DELETE,
  ForeignKeyFieldParamsType,
  ClassConstructor,
} from './types';
import Field from './field';
import type { TModel } from '../types';
import { ForeignKeyFieldRequiredParamsMissingError } from './exceptions';
import Engine, { EngineFields } from '../../engine';
import { generateUUID } from '../../utils';
import { This } from '../../types';
import { Model } from '../model';

/**
 * This type of field is special and is supposed to hold foreign key references to another field of another model.
 * Usually in relational databases like postgres we can have related fields like `user_id` inside of the table `posts`.
 * What this means that each value in the column `user_id` is one of the ids of the `users` table. This means that we
 * can use this value to join them together.
 */
export default class ForeignKeyField<
  F extends Field = any,
  D extends N extends true
    ? (T extends undefined ? M['fields'][RF]['type'] : T) | undefined | null
    :
        | (T extends undefined ? M['fields'][RF]['type'] : T)
        | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  T = undefined,
  M extends Model = Model,
  RF extends string = any,
  RN extends string = any,
  RNN extends string = any
> extends Field<F, D, U, N, A, CA> {
  type!: T extends undefined ? M['fields'][RF]['type'] : T;
  typeName: string = ForeignKeyField.name;
  relatedTo!: string;
  onDelete!: ON_DELETE;
  customName?: string;
  toField: RF;
  relationName: RNN;
  _originalRelatedName?: string;

  constructor(
    params: ForeignKeyFieldParamsType<F, D, U, N, A, CA, T, M, RF, RN, RNN>
  ) {
    super(params);

    let relatedToAsString: string = params.relatedTo as string;
    const isRelatedToNotAString: boolean = typeof params.relatedTo !== 'string';
    if (isRelatedToNotAString) {
      relatedToAsString = (params.relatedTo as ClassConstructor<Model>).name;
    }

    const isRelationNameDefined = typeof params.relationName === 'string';
    if (isRelationNameDefined) {
      this.relationName = params.relationName as RNN;
    } else {
      this.relationName = (relatedToAsString.charAt(0).toLowerCase() +
        relatedToAsString.slice(1)) as RNN;
    }
    this.relatedTo = relatedToAsString;
    this.customName = params.customName;
    this._originalRelatedName = params.relatedName;
    this.onDelete = params.onDelete;
    this.toField = params.toField;
  }

  static new<
    I extends This<typeof ForeignKeyField>,
    D extends N extends true
      ? (T extends undefined ? M['fields'][RF]['type'] : T) | undefined | null
      :
          | (T extends undefined ? M['fields'][RF]['type'] : T)
          | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any,
    T = undefined,
    M extends Model = Model,
    RF extends string = any,
    RN extends string = any,
    RNN extends string = any
  >(
    this: I,
    params: ForeignKeyFieldParamsType<
      InstanceType<I>,
      D,
      U,
      N,
      A,
      CA,
      T,
      M,
      RF,
      RN,
      RNN
    >
  ) {
    return new this(params) as ForeignKeyField<
      InstanceType<I>,
      D,
      U,
      N,
      A,
      CA,
      T,
      M,
      RF,
      RN,
      RNN
    >;
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