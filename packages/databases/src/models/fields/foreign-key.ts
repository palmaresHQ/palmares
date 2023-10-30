import { ON_DELETE, ForeignKeyFieldParamsType, ClassConstructor, MaybeNull } from './types';
import Field, { UnopinionatedField } from './field';
import { ForeignKeyFieldRequiredParamsMissingError } from './exceptions';
import DatabaseAdapter from '../../engine';
import { generateUUID } from '../../utils';
import { This } from '../../types';
import { Model } from '../model';
import { ModelType } from '../..';

/**
 * This allows us to create a foreign key field on the database. A foreign key field represents a relation between two models. So pretty much a model will be related
 * to another model.
 *
 * @example
 * ```ts
 * class User extends models.Model<User>() {
 *   fields = {
 *     id: models.AutoField.new(),
 *     firstName: models.CharField.new(),
 *     lastName: models.CharField.new(),
 *    }
 * }
 *
 * const userId = foreignKey({
 *    relatedTo: User,
 *    toField: 'id',
 *    onDelete: models.fields.ON_DELETE.CASCADE,
 *    relatedName: 'user',
 *   relationName: 'userProfile'
 * })
 * ```
 */
export function foreignKey<
  TDefaultValue extends MaybeNull<
    | (TCustomType extends undefined
        ? TRelatedModel extends typeof Model
          ? InstanceType<TRelatedModel>['fields'][TRelatedField] extends Field<any, any, any, any, any, any, any, any>
            ? InstanceType<TRelatedModel>['fields'][TRelatedField]['_type']['input']
            : TCustomType
          : TCustomType
        : TCustomType)
    | undefined,
    TNull
  > = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TCustomType = undefined,
  TRelatedModel = any,
  TRelatedField extends string = any,
  TRelatedName extends string = any,
  TRelationName extends string = any,
>(
  params: ForeignKeyFieldParamsType<
    ForeignKeyField,
    TDefaultValue,
    TUnique,
    TNull,
    TAuto,
    TDatabaseName,
    TCustomAttributes,
    TCustomType,
    TRelatedModel,
    TRelatedField,
    TRelatedName,
    TRelationName
  >
) {
  return new ForeignKeyField(params);
}

/**
 * The lazy version of the foreign key field. This is useful when you want to create a foreign key field to a model that is not defined yet.
 * With that you will be only working with types directly and you will be able to define the `relatedTo` as string.
 *
 * @example
 * ```ts
 * class User extends models.Model<User>() {
 *   fields = {
 *     id: models.AutoField.new(),
 *     firstName: models.CharField.new(),
 *     lastName: models.CharField.new(),
 *    }
 * }
 *
 * const userId = foreignKeyLazy<typeof User>()({
 *   relatedTo: 'User',
 *   toField: 'id',
 *   onDelete: models.fields.ON_DELETE.CASCADE,
 *   relatedName: 'user',
 *   relationName: 'userProfile'
 * });
 * ```
 */
export function foreignKeyLazy<TRelatedModel>() {
  return <
    TDefaultValue extends MaybeNull<
      | (TCustomType extends undefined
          ? TRelatedModel extends typeof Model
            ? InstanceType<TRelatedModel>['fields'][TRelatedField] extends Field<any, any, any, any, any, any, any, any>
              ? InstanceType<TRelatedModel>['fields'][TRelatedField]['_type']['input']
              : TCustomType
            : TCustomType
          : TCustomType)
      | undefined,
      TNull
    > = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
    TCustomType = undefined,
    TRelatedField extends string = any,
    TRelatedName extends string = any,
    TRelationName extends string = any,
  >(
    params: Omit<
      ForeignKeyFieldParamsType<
        ForeignKeyField,
        TDefaultValue,
        TUnique,
        TNull,
        TAuto,
        TDatabaseName,
        TCustomAttributes,
        TCustomType,
        TRelatedModel,
        TRelatedField,
        TRelatedName,
        TRelationName
      >,
      'relatedTo'
    > & {
      relatedTo: string;
    }
  ) => {
    return ForeignKeyField.lazy<TRelatedModel>()<
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TCustomType,
      TRelatedField,
      TRelatedName,
      TRelationName
    >(params);
  };
}

/**
 * This type of field is special and is supposed to hold foreign key references to another field of another model.
 * Usually in relational databases like postgres we can have related fields like `user_id` inside of the table `posts`.
 * What this means that each value in the column `user_id` is one of the ids of the `users` table. This means that we
 * can use this value to join them together.
 */
export default class ForeignKeyField<
  TType extends {
    input: TCustomType extends undefined
      ? TRelatedModel extends abstract new (...args: any) => any
        ? InstanceType<TRelatedModel> extends {
            fields: infer TModelFields;
          }
          ? TRelatedField extends keyof TModelFields
            ? TModelFields[TRelatedField] extends Field<any, any, any, any, any, any, any, any>
              ? TModelFields[TRelatedField]['_type']['input']
              : never
            : never
          : never
        : never
      : TCustomType;
    output: TCustomType extends undefined
      ? TRelatedModel extends abstract new (...args: any) => any
        ? InstanceType<TRelatedModel> extends {
            fields: infer TModelFields;
          }
          ? TRelatedField extends keyof TModelFields
            ? TModelFields[TRelatedField] extends Field<any, any, any, any, any, any, any, any>
              ? TModelFields[TRelatedField]['_type']['output']
              : never
            : never
          : never
        : never
      : TCustomType;
  } = {
    input: any;
    output: any;
  },
  TField extends Field = any,
  TDefaultValue extends MaybeNull<
    | (TCustomType extends undefined
        ? TRelatedModel extends typeof Model
          ? InstanceType<TRelatedModel>['fields'][TRelatedField] extends Field<any, any, any, any, any, any, any, any>
            ? InstanceType<TRelatedModel>['fields'][TRelatedField]['_type']['input']
            : TCustomType
          : TCustomType
        : TCustomType)
    | undefined,
    TNull
  > = undefined,
  TUnique extends boolean = false,
  TNull extends boolean = false,
  TAuto extends boolean = false,
  TDatabaseName extends string | null | undefined = undefined,
  TCustomAttributes = any,
  TCustomType = undefined,
  TRelatedModel = any,
  TRelatedField extends string = any,
  TRelatedName extends string = any,
  TRelationName extends string = any,
> extends UnopinionatedField<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  declare _type: TType;
  modelRelatedTo!: TRelatedModel;
  typeName: string = ForeignKeyField.name;
  customName?: string;
  relatedTo: TRelatedModel;
  onDelete!: ON_DELETE;
  toField: TRelatedField;
  relationName: TRelationName;
  _originalRelatedName?: string;

  constructor(
    params: ForeignKeyFieldParamsType<
      TField,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TCustomType,
      TRelatedModel,
      TRelatedField,
      TRelatedName,
      TRelationName
    >
  ) {
    super(params);

    let relatedToAsString: string = params.relatedTo as string;
    const isRelatedToNotAString: boolean = typeof params.relatedTo !== 'string';
    if (isRelatedToNotAString) relatedToAsString = (params.relatedTo as ClassConstructor<Model>).name;

    const isRelationNameDefined = typeof params.relationName === 'string';

    if (isRelationNameDefined) this.relationName = params.relationName as TRelationName;
    else this.relationName = (relatedToAsString.charAt(0).toLowerCase() + relatedToAsString.slice(1)) as TRelationName;

    this.relatedTo = relatedToAsString as unknown as TRelatedModel;
    this.customName = params.customName;
    this._originalRelatedName = params.relatedName;
    this.onDelete = params.onDelete;
    this.toField = params.toField;
  }

  /**
   * This is used for lazy loading the type of the related model. By default you will do something like
   *
   * @example
   * ```ts
   * class User extends models.Model<User>() {
   *   fields = {
   *      id: models.AutoField.new(),
   *      firstName: models.CharField.new(),
   *      profile: models.ForeignKeyField.new({
   *        relatedTo: Profile,
   *        onDelete: models.fields.ON_DELETE.CASCADE,
   *        toField: 'id',
   *        relatedName: 'profile',
   *        relationName: 'userProfile'
   *      })
   *   }
   * }
   * ```
   *
   * That's great, but can be a bit annoying if the Profile model is defined another time or lazily. So we offer the option to do something like:
   *
   * @example
   * ```ts
   * class User extends models.Model<User>() {
   *   fields = {
   *      id: models.AutoField.new(),
   *      firstName: models.CharField.new(),
   *      profile: models.ForeignKeyField.lazy<typeof Profile>()({
   *        relatedTo: 'Profile', // Here we are defining profile as a string.
   *        onDelete: models.fields.ON_DELETE.CASCADE,
   *        toField: 'id',
   *        relatedName: 'profile',
   *        relationName: 'userProfile'
   *      })
   *   }
   * }
   * ```
   *
   * With that we can lazy load the relation while still maintaining the type of the related model.
   */
  static lazy<TRelatedModel>() {
    return <
      TDefaultValue extends MaybeNull<
        | (TCustomType extends undefined
            ? TRelatedModel extends typeof Model
              ? InstanceType<TRelatedModel>['fields'][TRelatedField] extends Field<
                  any,
                  any,
                  any,
                  any,
                  any,
                  any,
                  any,
                  any
                >
                ? InstanceType<TRelatedModel>['fields'][TRelatedField]['_type']['input']
                : TCustomType
              : TCustomType
            : TCustomType)
        | undefined,
        TNull
      > = undefined,
      TUnique extends boolean = false,
      TNull extends boolean = false,
      TAuto extends boolean = false,
      TDatabaseName extends string | null | undefined = undefined,
      TCustomAttributes = any,
      TCustomType = undefined,
      TRelatedField extends string = any,
      TRelatedName extends string = any,
      TRelationName extends string = any,
    >(
      params: Omit<
        ForeignKeyFieldParamsType<
          ForeignKeyField,
          TDefaultValue,
          TUnique,
          TNull,
          TAuto,
          TDatabaseName,
          TCustomAttributes,
          TCustomType,
          TRelatedModel,
          TRelatedField,
          TRelatedName,
          TRelationName
        >,
        'relatedTo'
      > & {
        relatedTo: string;
      }
    ) =>
      new this(params as any) as ForeignKeyField<
        {
          input: TCustomType extends undefined
            ? TRelatedModel extends abstract new (...args: any) => any
              ? InstanceType<TRelatedModel> extends {
                  fields: infer TModelFields;
                }
                ? TRelatedField extends keyof TModelFields
                  ? TModelFields[TRelatedField] extends Field<any, any, any, any, any, any, any, any>
                    ? TModelFields[TRelatedField]['_type']['input']
                    : never
                  : never
                : never
              : never
            : TCustomType;
          output: TCustomType extends undefined
            ? TRelatedModel extends abstract new (...args: any) => any
              ? InstanceType<TRelatedModel> extends {
                  fields: infer TModelFields;
                }
                ? TRelatedField extends keyof TModelFields
                  ? TModelFields[TRelatedField] extends Field<any, any, any, any, any, any, any, any>
                    ? TModelFields[TRelatedField]['_type']['output']
                    : never
                  : never
                : never
              : never
            : TCustomType;
        },
        ForeignKeyField,
        TDefaultValue,
        TUnique,
        TNull,
        TAuto,
        TDatabaseName,
        TCustomAttributes,
        TCustomType,
        TRelatedModel,
        TRelatedField,
        TRelatedName,
        TRelationName
      >;
  }

  static new<
    TField extends This<typeof ForeignKeyField>,
    TDefaultValue extends MaybeNull<
      | (TCustomType extends undefined
          ? TRelatedModel extends typeof Model
            ? InstanceType<TRelatedModel>['fields'][TRelatedField] extends Field<any, any, any, any, any, any, any, any>
              ? InstanceType<TRelatedModel>['fields'][TRelatedField]['_type']['input']
              : TCustomType
            : TCustomType
          : TCustomType)
      | undefined,
      TNull
    > = undefined,
    TUnique extends boolean = false,
    TNull extends boolean = false,
    TAuto extends boolean = false,
    TDatabaseName extends string | null | undefined = undefined,
    TCustomAttributes = any,
    TCustomType = undefined,
    TRelatedModel = any,
    TRelatedField extends string = any,
    TRelatedName extends string = any,
    TRelationName extends string = any,
  >(
    this: TField,
    params: ForeignKeyFieldParamsType<
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TCustomType,
      TRelatedModel,
      TRelatedField,
      TRelatedName,
      TRelationName
    >
  ) {
    return new this(params) as ForeignKeyField<
      {
        input: TCustomType extends undefined
          ? TRelatedModel extends abstract new (...args: any) => any
            ? InstanceType<TRelatedModel> extends {
                fields: infer TModelFields;
              }
              ? TRelatedField extends keyof TModelFields
                ? TModelFields[TRelatedField] extends Field<any, any, any, any, any, any, any, any>
                  ? TModelFields[TRelatedField]['_type']['input']
                  : never
                : never
              : never
            : never
          : TCustomType;
        output: TCustomType extends undefined
          ? TRelatedModel extends abstract new (...args: any) => any
            ? InstanceType<TRelatedModel> extends {
                fields: infer TModelFields;
              }
              ? TRelatedField extends keyof TModelFields
                ? TModelFields[TRelatedField] extends Field<any, any, any, any, any, any, any, any>
                  ? TModelFields[TRelatedField]['_type']['output']
                  : never
                : never
              : never
            : never
          : TCustomType;
      },
      InstanceType<TField>,
      TDefaultValue,
      TUnique,
      TNull,
      TAuto,
      TDatabaseName,
      TCustomAttributes,
      TCustomType,
      TRelatedModel,
      TRelatedField,
      TRelatedName,
      TRelationName
    >;
  }

  init(fieldName: string, model: ModelType) {
    const isRelatedToAndOnDeleteNotDefined = typeof this.relatedTo !== 'string' && typeof this.onDelete !== 'string';
    const relatedToAsString = this.relatedTo as string;
    const originalNameOfModel = model.originalName();

    if (isRelatedToAndOnDeleteNotDefined) throw new ForeignKeyFieldRequiredParamsMissingError(this.fieldName);

    const hasNotIncludesAssociation =
      (model.associations[relatedToAsString] || []).some((association) => association.fieldName === fieldName) ===
      false;
    if (hasNotIncludesAssociation) {
      model.associations[relatedToAsString] = model.associations[relatedToAsString] || [];
      model.associations[relatedToAsString].push(this);
    }

    // Appends to the model the other models this model is related to.
    model.directlyRelatedTo[relatedToAsString] = model.directlyRelatedTo[relatedToAsString] || [];
    model.directlyRelatedTo[relatedToAsString].push(this.relationName);

    // this will update the indirectly related models of the engine instance.
    // This means that for example, if the Post model has a foreign key to the User model
    // There is no way for the User model to know that it is related to the Post model.
    // Because of this we update this value on the engine instance. Updating the array on the engine instance
    // will also reflect on the `relatedTo` array in the model instance.
    if (this._originalRelatedName) {
      model.indirectlyRelatedModels[relatedToAsString] = model.indirectlyRelatedModels[relatedToAsString] || {};
      model.indirectlyRelatedModels[relatedToAsString][originalNameOfModel] =
        model.indirectlyRelatedModels[relatedToAsString][originalNameOfModel] || [];
      model.indirectlyRelatedModels[relatedToAsString][originalNameOfModel].push(this._originalRelatedName);
    }
    super.init(fieldName, model);

    const wasRelatedNameDefined: boolean = typeof this.relatedName === 'string';

    if (wasRelatedNameDefined === false) {
      const relatedToWithFirstStringLower: string =
        relatedToAsString.charAt(0).toLowerCase() + relatedToAsString.slice(1);
      const originalModelNameWithFirstStringUpper: string =
        originalNameOfModel.charAt(0).toUpperCase() + originalNameOfModel.slice(1);
      this._originalRelatedName = `${relatedToWithFirstStringLower}${originalModelNameWithFirstStringUpper}s`;
    }
  }

  /**
   * Check if the related model is from the engine instance so we can override the field creation and change the type of the field to some other field.
   *
   * This is useful to manage unmanaged relations. For example, we have a model in this database and another one in the other database. We can relate both
   * of them without any issues. What this will do is convert the value of this field that does not exist on this database to the field it relates to.
   *
   * @example
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
  async isRelatedModelFromEngineInstance(engineInstance: DatabaseAdapter): Promise<[boolean, Field?]> {
    const relatedToAsString = this.relatedTo as string;
    const relatedModel = engineInstance.__modelsOfEngine[relatedToAsString];
    if (relatedModel !== undefined) return [true, undefined];
    else {
      const modelRelatedTo = engineInstance.__modelsFilteredOutOfEngine[relatedToAsString];
      if (modelRelatedTo === undefined) return [true, undefined];
      else {
        const modelInstance = new modelRelatedTo();
        const fieldRelatedTo = modelInstance.fields[this.toField];
        const clonedField = await fieldRelatedTo.clone();

        clonedField.model = this.model;
        clonedField.fieldName = this.fieldName;
        clonedField.databaseName = this.databaseName as undefined;
        (clonedField as any).defaultValue = this.defaultValue;
        (clonedField as any).allowNull = this.allowNull;
        clonedField.dbIndex = this.dbIndex;
        (clonedField as any).hasDefaultValue = this.hasDefaultValue;
        clonedField.underscored = this.underscored;
        (clonedField as any).unique = this.unique;
        clonedField.isAuto = false;
        clonedField.primaryKey = false;
        modelInstance.fields[this.fieldName] = clonedField;
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
    const modelConstructor = this.model.constructor as ModelType;
    const isModelAStateModel = isModelDefined && modelConstructor.isState === true;
    if (isModelAStateModel) return `${generateUUID()}-${this._originalRelatedName}`;
    else return this._originalRelatedName;
  }

  /**
   * This is mostly used internally by the engine to stringify the contents of the field on migrations. But you can override this if you want to
   * extend the ForeignKeyField class.
   *
   * @example
   * ```
   * class CustomForeignKeyField extends ForeignKeyField {
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
   * On this example, your custom ForeignKeyField instance defines a `aCustomValue` property that will be added on the migrations. It is useful if
   * you have created a custom field and wants to implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation. Use `'  '.repeat(indentation + 1);`
   * @param customParams - Custom parameters to append to the stringified field.
   *
   * @returns The stringified field.
   */
  async toString(
    indentation = 0,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    return super.toString(
      indentation,
      `${ident}relatedTo: "${this.relatedTo}",\n` +
        `${ident}toField: "${this.toField}",\n` +
        `${ident}onDelete: models.fields.ON_DELETE.${this.onDelete.toUpperCase()},\n` +
        `${ident}customName: ${typeof this.customName === 'string' ? `"${this.customName}"` : this.customName},\n` +
        `${ident}relationName: "${this.relationName}",\n` +
        `${ident}relatedName: ${
          typeof this._originalRelatedName === 'string' ? `"${this._originalRelatedName}",` : this._originalRelatedName
        }`
    );
  }

  /**
   * This is used internally by the engine to compare if the field is equal to another field. You can override this if you want to extend the ForeignKeyField class.
   *
   * @example
   * ```
   * class CustomForeignKeyField extends ForeignKeyField {
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

  /**
   * This is used internally by the engine for cloning the field to a new instance. By doing that you are able to get the constructor options of the field.
   *
   * @example
   * ```
   * class CustomForeignKeyField extends ForeignKeyField {
   *  aCustomValue: string;
   *
   * async constructorOptions(field?: ForeignKeyField) {
   *   if (!field) field = this as ForeignKeyField;
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
