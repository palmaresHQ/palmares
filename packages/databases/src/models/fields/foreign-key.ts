import {
  ON_DELETE,
  ForeignKeyFieldParamsType,
  ClassConstructor,
} from './types';
import Field from './field';
import type { TModel } from '../types';
import { ForeignKeyFieldRequiredParamsMissingError } from './exceptions';
import Engine from '../../engine';
import { generateUUID } from '../../utils';
import { This } from '../../types';
import model, { Model } from '../model';

/**
 * This type of field is special and is supposed to hold foreign key references to another field of another model.
 * Usually in relational databases like postgres we can have related fields like `user_id` inside of the table `posts`.
 * What this means that each value in the column `user_id` is one of the ids of the `users` table. This means that we
 * can use this value to join them together.
 */
export default class ForeignKeyField<
  F extends Field = any,
  TLazyDefaultValue = undefined,
  D extends N extends true
    ?
        | (TLazyDefaultValue extends undefined
            ? T extends undefined
              ? M extends Model<infer ThisModel>
                ? ThisModel extends Model
                  ? ThisModel['fields'][RF]['type']
                  : T
                : T
              : T
            : TLazyDefaultValue)
        | undefined
        | null
    :
        | (TLazyDefaultValue extends undefined
            ? T extends undefined
              ? M extends Model<infer ThisModel>
                ? ThisModel extends Model
                  ? ThisModel['fields'][RF]['type']
                  : T
                : T
              : T
            : TLazyDefaultValue)
        | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  T = undefined,
  M = any,
  RF extends string = any,
  RN extends string = any,
  RNN extends string = any
> extends Field<F, D, U, N, A, CA> {
  type!: TLazyDefaultValue extends undefined
    ? T extends undefined
      ? M extends Model<infer ThisModel>
        ? ThisModel extends InstanceType<ReturnType<typeof model>> | Model
          ? ThisModel['fields'][RF]['type']
          : T
        : T
      : T
    : TLazyDefaultValue;
  modelRelatedTo!: M extends Model<infer ThisModel> ? ThisModel : M;
  typeName: string = ForeignKeyField.name;
  relatedTo!: string;
  onDelete!: ON_DELETE;
  customName?: string;
  toField: RF;
  relationName: RNN;
  _originalRelatedName?: string;

  constructor(
    params: ForeignKeyFieldParamsType<
      F,
      TLazyDefaultValue,
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
    TLazyDefaultValue = undefined,
    D extends N extends true
      ?
          | (TLazyDefaultValue extends undefined
              ? T extends undefined
                ? M extends Model<infer ThisModel>
                  ? ThisModel extends Model
                    ? ThisModel['fields'][RF]['type']
                    : T
                  : T
                : T
              : TLazyDefaultValue)
          | undefined
          | null
      :
          | (TLazyDefaultValue extends undefined
              ? T extends undefined
                ? M extends Model<infer ThisModel>
                  ? ThisModel extends Model
                    ? ThisModel['fields'][RF]['type']
                    : T
                  : T
                : T
              : TLazyDefaultValue)
          | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any,
    T = undefined,
    M = Model,
    RF extends string = any,
    RN extends string = any,
    RNN extends string = any
  >(
    this: I,
    params: ForeignKeyFieldParamsType<
      InstanceType<I>,
      TLazyDefaultValue,
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
      TLazyDefaultValue,
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

    const hasNotIncludesAssociation =
      (model.associations[this.relatedTo] || []).some(
        (association) => association.fieldName === fieldName
      ) === false;
    if (hasNotIncludesAssociation) {
      model.associations[this.relatedTo] =
        model.associations[this.relatedTo] || [];
      model.associations[this.relatedTo].push(this);
    }

    // Appends to the model the other models this model is related to.
    model.directlyRelatedTo[this.relatedTo] =
      model.directlyRelatedTo[this.relatedTo] || [];
    model.directlyRelatedTo[this.relatedTo].push(this.relationName);

    // this will update the indirectly related models of the engine instance.
    // This means that for example, if the Post model has a foreign key to the User model
    // There is no way for the User model to know that it is related to the Post model.
    // Because of this we update this value on the engine instance. Updating the array on the engine instance
    // will also reflect on the `relatedTo` array in the model instance.
    if (engineInstance && this._originalRelatedName) {
      engineInstance._indirectlyRelatedModels[this.relatedTo] =
        engineInstance._indirectlyRelatedModels[this.relatedTo] || {};
      engineInstance._indirectlyRelatedModels[this.relatedTo][
        model.originalName
      ] =
        engineInstance._indirectlyRelatedModels[this.relatedTo][
          model.originalName
        ] || [];
      engineInstance._indirectlyRelatedModels[this.relatedTo][
        model.originalName
      ].push(this._originalRelatedName);
    }
    await super.init(fieldName, model);

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
   * Check if the related model is from the engine instance so we can override the field creation and change the type of the field to some other field.
   *
   * This is useful to manage unmanaged relations. For example, we have a model in this database and another one in the other database. We can relate both
   * of them without any issues. What this will do is convert the value of this field that does not exist on this database to the field it relates to.
   *
   * For example:
   *
   * ```
   * class Facebook extends models.model<Facebook>() {
   *    fields = {
   *        id: IntegerField.new(),
   *        campaignName: CharField.new()
   *    }
   *
   *    options = {
   *        managed: false
   *    }
   * }
   *
   * const User = models.initialize('User', {
   *    fields: {
   *      id: AutoField.new(),
   *      firstName: CharField.new(),
   *      facebookId: ForeignKeyField({
   *         relatedTo: Facebook,
   *         toField: 'id',
   *         relatedName: 'facebookUsers',
   *         relationName: 'facebook'
   *      })
   *    }
   * })
   * ```
   *
   * Since the `facebookId` field is matching a field in an unmanaged model, the facebookId field will be translated to `IntegerField` AND NOT
   * the `ForeignKeyField`
   *
   * @param engineInstance - Needs the engine instance to check if the model exists in the engine instance or not.
   *
   * @returns - Returns an array where the first item is if the relatedmodel is from the engine instance (false if not) and the field it should
   * change to.
   */
  async isRelatedModelFromEngineInstance(
    engineInstance: Engine
  ): Promise<[boolean, Field?]> {
    const relatedModel = engineInstance._modelsOfEngine[this.relatedTo];

    if (relatedModel !== undefined) return [true, undefined];
    else {
      const modelRelatedTo =
        engineInstance._modelsFilteredOutOfEngine[this.relatedTo];
      if (modelRelatedTo === undefined) return [true, undefined];
      else {
        const modelRelatedToInitialized =
          await new modelRelatedTo().initializeBasic(engineInstance);
        const fieldRelatedTo = modelRelatedToInitialized.fields[this.toField];
        const clonedField = await fieldRelatedTo.clone();
        clonedField.model = this.model;
        clonedField.fieldName = this.fieldName;
        clonedField.databaseName = this.databaseName;
        (clonedField as any).defaultValue = this.defaultValue;
        (clonedField as any).allowNull = this.allowNull;
        clonedField.dbIndex = this.dbIndex;
        (clonedField as any).hasDefaultValue = this.hasDefaultValue;
        clonedField.underscored = this.underscored;
        (clonedField as any).unique = this.unique;
        clonedField.isAuto = false;
        clonedField.primaryKey = false;
        clonedField.model.fields[this.fieldName] = clonedField;
        return [false, clonedField];
      }
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
        `${ident}relationName: "${this.relationName}",\n` +
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

  async constructorOptions(field?: ForeignKeyField) {
    if (!field) field = this as ForeignKeyField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      relatedTo: field.relatedTo,
      toField: field.toField,
      onDelete: field.onDelete,
      customName: field.customName,
      relationName: field.relationName,
      relatedName: field.relatedName as string,
    };
  }
}
