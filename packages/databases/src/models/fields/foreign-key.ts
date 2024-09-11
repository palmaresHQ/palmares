import { AutoField } from './auto';
import { ForeignKeyFieldRequiredParamsMissingError } from './exceptions';
import { Field } from './field';
import { ClassConstructor, ForeignKeyFieldParamsType, MaybeNull, ON_DELETE } from './types';
import { define } from '../..';
import { generateUUID } from '../../utils';
import { type Model, initialize, model } from '../model';

import type { CustomImportsForFieldType } from './types';
import type { NewInstanceArgumentsCallback, TCompareCallback, TOptionsCallback, ToStringCallback } from './utils';
import type { DatabaseAdapter } from '../../engine';
import type { This } from '../../types';

/**
 * This allows us to create a foreign key field on the database.
 * A foreign key field represents a relation between two models.
 * So pretty much a model will be related
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
 * /
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
  TRelationName extends string = any
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
  return ForeignKeyField.new(params);
}

/**
 * The lazy version of the foreign key field. This is useful when you want to create a
 * foreign key field to a model that is not defined yet.
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
 * /
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
    TRelationName extends string = any
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
 * /
export class ForeignKeyField<
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
  TRelationName extends string = any
> extends UnopinionatedField<TType, TField, TDefaultValue, TUnique, TNull, TAuto, TDatabaseName, TCustomAttributes> {
  protected $$type = '$PForeignKeyField';
  declare _type: TType;
  modelRelatedTo!: TRelatedModel;
  typeName: string = ForeignKeyField.name;
  customName?: string;
  relatedTo: TRelatedModel;
  onDelete!: ON_DELETE;
  toField: TRelatedField;
  relationName: TRelationName;
  _originalRelatedName?: string;
  protected _fieldOfRelation?: Field<any, any, any, any, any, any, any, any>;

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
    if (isRelatedToNotAString) relatedToAsString = (params.relatedTo as any).getName();

    const isRelationNameDefined = typeof params.relationName === 'string';

    if (isRelationNameDefined) this.relationName = params.relationName;
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
   * That's great, but can be a bit annoying if the Profile model is defined another
   * time or lazily. So we offer the option to do something like:
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
   * /
  // eslint-disable-next-line no-shadow
  static lazy<TRelatedModel>() {
    return <
      // eslint-disable-next-line no-shadow
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
      // eslint-disable-next-line no-shadow
      TUnique extends boolean = false,
      // eslint-disable-next-line no-shadow
      TNull extends boolean = false,
      // eslint-disable-next-line no-shadow
      TAuto extends boolean = false,
      // eslint-disable-next-line no-shadow
      TDatabaseName extends string | null | undefined = undefined,
      // eslint-disable-next-line no-shadow
      TCustomAttributes = any,
      // eslint-disable-next-line no-shadow
      TCustomType = undefined,
      // eslint-disable-next-line no-shadow
      TRelatedField extends string = any,
      // eslint-disable-next-line no-shadow
      TRelatedName extends string = any,
      // eslint-disable-next-line no-shadow
      TRelationName extends string = any
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
    ) => new this(params as any);
  }

  static new<
    // eslint-disable-next-line no-shadow
    TField extends This<typeof ForeignKeyField>,
    // eslint-disable-next-line no-shadow
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
    // eslint-disable-next-line no-shadow
    TUnique extends boolean = false,
    // eslint-disable-next-line no-shadow
    TNull extends boolean = false,
    // eslint-disable-next-line no-shadow
    TAuto extends boolean = false,
    // eslint-disable-next-line no-shadow
    TDatabaseName extends string | null | undefined = undefined,
    // eslint-disable-next-line no-shadow
    TCustomAttributes = any,
    // eslint-disable-next-line no-shadow
    TCustomType = undefined,
    // eslint-disable-next-line no-shadow
    TRelatedModel = any,
    // eslint-disable-next-line no-shadow
    TRelatedField extends string = any,
    // eslint-disable-next-line no-shadow
    TRelatedName extends string = any,
    // eslint-disable-next-line no-shadow
    TRelationName extends string = any
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

    const modelAssociations = model.associations as any;
    const hasNotIncludesAssociation =
      (modelAssociations[relatedToAsString] || []).some(
        (association: Field<any, any, any, any, any, any, any>) => association.fieldName === fieldName
      ) === false;
    if (hasNotIncludesAssociation) {
      model.associations[relatedToAsString] = modelAssociations[relatedToAsString] || [];
      model.associations[relatedToAsString].push(this);
    }

    const modelDirectlyRelatedTo = model.directlyRelatedTo as any;
    // Appends to the model the other models this model is related to.
    model.directlyRelatedTo[relatedToAsString] = modelDirectlyRelatedTo[relatedToAsString] || [];
    model.directlyRelatedTo[relatedToAsString].push(this.relationName);

    // this will update the indirectly related models of the engine instance.
    // This means that for example, if the Post model has a foreign key to the User model
    // There is no way for the User model to know that it is related to the Post model.
    // Because of this we update this value on the engine instance. Updating the array on the engine instance
    // will also reflect on the `relatedTo` array in the model instance.
    if (this._originalRelatedName) {
      // eslint-disable-next-line ts/no-unnecessary-condition
      model.indirectlyRelatedModels[relatedToAsString] = model.indirectlyRelatedModels?.[relatedToAsString] || {};
      model.indirectlyRelatedModels[relatedToAsString][originalNameOfModel] =
        (model.indirectlyRelatedModels as any)?.[relatedToAsString]?.[originalNameOfModel] || [];
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

    // eslint-disable-next-line ts/no-unnecessary-condition
    model.indirectlyRelatedModels.$set?.[relatedToAsString]?.();
  }

  /**
   * Check if the related model is from the engine instance so we can override the
   * field creation and change the type of the field to some other field.
   *
   * This is useful to manage unmanaged relations. For example, we have a
   * model in this database and another one in the other database. We can relate both
   * of them without any issues. What this will do is convert the value of this
   * field that does not exist on this database to the field it relates to.
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
   * Since the `facebookId` field is matching a field in an unmanaged model, the facebookId
   * field will be translated to `IntegerField` AND NOT
   * the `ForeignKeyField`
   *
   * @param engineInstance - Needs the engine instance to check if the model exists in the engine instance or not.
   *
   * @returns - Returns an array where the first item is if the relatedmodel is
   * from the engine instance (false if not) and the field it should change to.
   * /
  async isRelatedModelFromEngineInstance(engineInstance: DatabaseAdapter): Promise<[boolean, Field?]> {
    const relatedToAsString = this.relatedTo as string;
    const relatedModel = engineInstance.__modelsOfEngine[relatedToAsString] as any;
    if (relatedModel !== undefined) {
      (this.modelRelatedTo as any) = relatedModel;
      return [true, undefined];
    } else {
      const modelRelatedTo = engineInstance.__modelsFilteredOutOfEngine[relatedToAsString] as any;
      if (modelRelatedTo === undefined) return [true, undefined];
      else {
        const modelInstance = new modelRelatedTo();
        const fieldRelatedTo = modelInstance.fields[this.toField];
        const clonedField = await fieldRelatedTo.clone();

        clonedField.model = this.model;
        clonedField.fieldName = this.fieldName;
        clonedField.databaseName = this.databaseName as undefined;
        clonedField.defaultValue = this.defaultValue;
        clonedField.allowNull = this.allowNull;
        clonedField.dbIndex = this.dbIndex;
        clonedField.hasDefaultValue = this.hasDefaultValue;
        clonedField.underscored = this.underscored;
        clonedField.unique = this.unique;
        clonedField.isAuto = false;
        clonedField.primaryKey = false;
        modelInstance.fields[this.fieldName] = clonedField;
        return [false, clonedField];
      }
    }
  }

  /**
   * This is needed for the state. Some ORMs cannot have the same relatedName twice.
   * What happens is that when recreating the state
   * we repeat the models from the database. By doing it this way we able to create
   * a random relatedName so we guarantee that the same related name will not be
   * used twice inside inside of the engine to two different models.
   *
   * This is a logic that should live here and not on the engine itself because the
   * engine should not be aware of such errors that might occur. We just want
   * to keep it simple to develop engines.
   *
   * @return - Returns a random relatedName if it is a state model, otherwise returns the normal related name.
   * /
  get relatedName() {
    const isModelDefined = (this.model as any) !== undefined;
    const modelConstructor = this.model.constructor as ModelType;
    const isModelAStateModel = isModelDefined && modelConstructor.isState === true;
    if (isModelAStateModel) return `${generateUUID()}-${this._originalRelatedName}`;
    else return this._originalRelatedName;
  }

  /**
   * This is mostly used internally by the engine to stringify the contents of the
   * field on migrations. But you can override this if you want to
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
   * On this example, your custom ForeignKeyField instance defines a `aCustomValue`
   * property that will be added on the migrations. It is useful if
   * you have created a custom field and wants to implement a custom logic during migrations.
   *
   * @param indentation - The number of spaces to use for indentation. Use `'  '.repeat(indentation + 1);`
   * @param customParams - Custom parameters to append to the stringified field.
   *
   * @returns The stringified field.
   * /
  async toString(indentation = 0, _customParams: string | undefined = undefined) {
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
   * This is used internally by the engine to compare if the field is equal to another field.
   * You can override this if you want to extend the ForeignKeyField class.
   *
   * @example
   * ```
   * class CustomForeignKeyField extends ForeignKeyField {
   *   aCustomValue: string;
   *
   *   compare(field:Field) {
   *      const fieldAsText = field as TextField;
   *      const isCustomValueEqual = fieldAsText.aCustomValue === this.aCustomValue;
   *      const [isEqual, changedAttributes] = await super.compare(field);
   *      if (!isCustomValueEqual) changedAttributes.push('aCustomValue');
   *      return [isCustomValueEqual && isEqual, changedAttributes]
   *   }
   * }
   * ```
   *
   * @param field - The field to compare.
   *
   * @returns A promise that resolves to a boolean indicating if the field is equal to the other field.
   * /
  async compare(field: Field): Promise<[boolean, string[]]> {
    const fieldAsForeignKey = field as ForeignKeyField;
    const fieldAsForeignKeyRelatedToAsString = fieldAsForeignKey.relatedTo as string;
    const isCustomNameEqual = fieldAsForeignKey.customName === this.customName;
    const isRelatedToEqual = fieldAsForeignKeyRelatedToAsString === this.relatedTo;
    const isToFieldEqual = fieldAsForeignKey.toField === this.toField;
    const isOnDeleteEqual = fieldAsForeignKey.onDelete === this.onDelete;
    const isRelationNameEqual = fieldAsForeignKey.relationName === this.relationName;

    const [isEqual, changedAttributes] = await super.compare(field);
    if (!isCustomNameEqual) changedAttributes.push('customName');
    if (!isRelatedToEqual) changedAttributes.push('relatedTo');
    if (!isToFieldEqual) changedAttributes.push('toField');
    if (!isOnDeleteEqual) changedAttributes.push('onDelete');
    if (!isRelationNameEqual) changedAttributes.push('relationName');

    return [
      isCustomNameEqual && isRelatedToEqual && isToFieldEqual && isOnDeleteEqual && isRelationNameEqual && isEqual,
      changedAttributes
    ];
  }

  /**
   * This is used internally by the engine for cloning the field to a new instance.
   * By doing that you are able to get the constructor options of the field.
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
   * /
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
      relatedName: field.relatedName as string
    };
  }
}
*/

export class ForeignKeyField<
  TType extends { create: any; read: any; update: any } = { create: any; read: any; update: any },
  TDefinitions extends {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    defaultValue: any;
    underscored: boolean;
    typeName: string;
    databaseName: string | null | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    relatedTo: any;
    onDelete: ON_DELETE;
    relatedName: string;
    relationName: string;
    toField: string;
  } = {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    defaultValue: any;
    underscored: boolean;
    typeName: string;
    databaseName: string | null | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    relatedTo: any;
    onDelete: ON_DELETE;
    relatedName: string;
    relationName: string;
    toField: string;
  }
> extends Field<TType, TDefinitions> {
  protected $$type = '$PForeignKeyField';
  protected static __typeName = 'ForeignKeyField';
  protected __relatedTo: TDefinitions['relatedTo'];
  protected __onDelete: TDefinitions['onDelete'];
  protected __relatedName: TDefinitions['relatedName'];
  protected __relationName: TDefinitions['relationName'];
  protected __toField: TDefinitions['toField'];

  constructor(params: Pick<TDefinitions, 'relatedTo' | 'onDelete' | 'relatedName' | 'relationName' | 'toField'>) {
    super(params);
    this.__relatedTo = params.relatedTo;
    this.__onDelete = params.onDelete;
    this.__relatedName = params.relatedName;
    this.__relationName = params.relationName;
    this.__toField = params.toField;
  }

  setCustomAttributes<
    const TCustomAttributes extends Parameters<
      TDefinitions['engineInstance']['fields']['autoFieldParser']['translate']
    >[0]['customAttributes']
  >(
    customAttributes: TCustomAttributes
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TCustomAttributes;
    }
  > {
    (this.__customAttributes as any) = customAttributes as any;

    return this as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TCustomAttributes;
      }
    >;
  }

  unique<TUnique extends boolean = true>(
    isUnique?: TUnique
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TUnique;
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.unique(isUnique) as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TUnique;
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  allowNull<TNull extends boolean = true>(
    isNull?: TNull
  ): ForeignKeyField<
    {
      create: TType['create'] | null | undefined;
      read: TType['read'] | null | undefined;
      update: TType['update'] | null | undefined;
    },
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TNull;
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.allowNull(isNull) as unknown as ForeignKeyField<
      {
        create: TType['create'] | null | undefined;
        read: TType['read'] | null | undefined;
        update: TType['update'] | null | undefined;
      },
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TNull;
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  /**
   * This method is used to create an index on the database for this field.
   */
  dbIndex<TDbIndex extends boolean = true>(
    isDbIndex: TDbIndex
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDbIndex;
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.dbIndex(isDbIndex) as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDbIndex;
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  underscored<TUnderscored extends boolean = true>(
    isUnderscored?: TUnderscored
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TUnderscored;
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.underscored(isUnderscored) as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TUnderscored;
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  primaryKey<TIsPrimaryKey extends boolean = true>(
    isPrimaryKey?: TIsPrimaryKey
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TIsPrimaryKey;
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.primaryKey(isPrimaryKey) as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TIsPrimaryKey;
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  auto<TIsAuto extends boolean = true>(
    isAuto?: TIsAuto
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TIsAuto;
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.auto(isAuto) as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TIsAuto;
        defaultValue: TDefinitions['defaultValue'];
        typeName: TDefinitions['typeName'];
        databaseName: TDefinitions['databaseName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  default<TDefault extends TType['create']>(
    defaultValue: TDefault
  ): ForeignKeyField<
    {
      create: TDefault | null | undefined;
      read: TType['read'];
      update: TType['update'];
    },
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefault;
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.default(defaultValue) as unknown as ForeignKeyField<
      {
        create: TDefault | null | undefined;
        read: TType['read'];
        update: TType['update'];
      },
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefault;
        databaseName: TDefinitions['databaseName'];
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  databaseName<TDatabaseName extends string>(
    databaseName: TDatabaseName
  ): ForeignKeyField<
    TType,
    {
      [TKey in Exclude<
        keyof TDefinitions,
        | 'underscored'
        | 'allowNull'
        | 'dbIndex'
        | 'unique'
        | 'isPrimaryKey'
        | 'auto'
        | 'defaultValue'
        | 'databaseName'
        | 'typeName'
        | 'engineInstance'
        | 'customAttributes'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDatabaseName;
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    }
  > {
    return super.databaseName(databaseName) as unknown as ForeignKeyField<
      TType,
      {
        [TKey in Exclude<
          keyof TDefinitions,
          | 'underscored'
          | 'allowNull'
          | 'dbIndex'
          | 'unique'
          | 'isPrimaryKey'
          | 'auto'
          | 'defaultValue'
          | 'databaseName'
          | 'typeName'
          | 'engineInstance'
          | 'customAttributes'
        >]: TDefinitions[TKey];
      } & {
        unique: TDefinitions['unique'];
        allowNull: TDefinitions['allowNull'];
        dbIndex: TDefinitions['dbIndex'];
        underscored: TDefinitions['underscored'];
        isPrimaryKey: TDefinitions['isPrimaryKey'];
        auto: TDefinitions['auto'];
        defaultValue: TDefinitions['defaultValue'];
        databaseName: TDatabaseName;
        typeName: TDefinitions['typeName'];
        engineInstance: TDefinitions['engineInstance'];
        customAttributes: TDefinitions['customAttributes'];
      }
    >;
  }

  /**
   * This method can be used to override the type of a field. This is useful for library
   * maintainers that want to support the field type but the default type provided by palmares
   * is not the one that the user want to use.
   *
   * ### Note
   *
   * Your library should provide documentation of the fields that are supported.
   */
  static overrideType<
    TDefinitions extends {
      customAttributes: any;
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      typeName: string;
      engineInstance: DatabaseAdapter;
    }
  >(args?: {
    typeName: string;
    toStringCallback?: ToStringCallback;
    compareCallback?: TCompareCallback;
    optionsCallback?: TOptionsCallback;
    newInstanceCallback?: NewInstanceArgumentsCallback;
    customImports?: CustomImportsForFieldType[];
  }): TDefinitions['customAttributes'] extends undefined
    ? {
        new: <
          const TRelatedTo extends any | (() => any) | ((_: { create: any; read: any; update: any }) => any),
          const TForeignKeyParams extends {
            toField: ExtractFieldNameOptionsOfModel<TRelatedTo>;
            onDelete: ON_DELETE;
            relatedName: string;
            relationName: string;
          }
        >(
          params: TForeignKeyParams & {
            relatedTo: TRelatedTo;
          }
        ) => ForeignKeyField<
          {
            create: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>;
            read: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>;
            update: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>;
          },
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            defaultValue: TDefinitions['defaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
            relatedTo: TRelatedTo;
            onDelete: TForeignKeyParams['onDelete'];
            relatedName: TForeignKeyParams['relatedName'];
            relationName: TForeignKeyParams['relationName'];
            toField: TForeignKeyParams['toField'];
          }
        >;
      }
    : {
        new: <
          const TRelatedTo extends any | (() => any) | ((_: { create: any; read: any; update: any }) => any),
          const TForeignKeyParams extends {
            toField: ExtractFieldNameOptionsOfModel<TRelatedTo>;
            onDelete: ON_DELETE;
            relatedName: string;
            relationName: string;
          }
        >(
          params: TForeignKeyParams & {
            relatedTo: TRelatedTo;
          } & TDefinitions['customAttributes']
        ) => ForeignKeyField<
          {
            create: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>;
            read: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>;
            update: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>;
          },
          {
            unique: TDefinitions['unique'];
            auto: TDefinitions['auto'];
            allowNull: TDefinitions['allowNull'];
            dbIndex: TDefinitions['dbIndex'];
            isPrimaryKey: TDefinitions['isPrimaryKey'];
            defaultValue: TDefinitions['defaultValue'];
            underscored: boolean;
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
            relatedTo: TRelatedTo;
            onDelete: TForeignKeyParams['onDelete'];
            relatedName: TForeignKeyParams['relatedName'];
            relationName: TForeignKeyParams['relationName'];
            toField: TForeignKeyParams['toField'];
          }
        >;
      } {
    const newField = super.overrideType(args) as any;
    /** We remove the data needed for ForeignKeyField */
    newField.new = (params: any) => {
      const newInstance = new this(params);
      const keysOfForeignKeyAttributes = new Set(['relatedTo', 'toField', 'onDelete', 'relatedName', 'relationName']);
      const customAttributes = Object.keys(params).reduce((acc, key) => {
        if (keysOfForeignKeyAttributes.has(key)) return acc;
        acc[key] = params[key];
        return acc;
      }, {} as any);
      (newInstance as any)['__customAttributes'] = customAttributes;

      return newInstance;
    };
    return super.overrideType(args) as any;
  }

  static new<
    const TRelatedTo extends any | (() => any) | ((_: { create: any; read: any; update: any }) => any),
    const TForeignKeyParams extends {
      toField: ExtractFieldNameOptionsOfModel<TRelatedTo>;
      onDelete: ON_DELETE;
      relatedName: string;
      relationName: string;
    }
  >(
    params: TForeignKeyParams & {
      relatedTo: TRelatedTo;
    }
  ): ForeignKeyField<
    {
      create: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>;
      read: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>;
      update: ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>;
    },
    {
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      underscored: boolean;
      typeName: string;
      databaseName: string | null | undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
      relatedTo: TRelatedTo;
      onDelete: TForeignKeyParams['onDelete'];
      relatedName: TForeignKeyParams['relatedName'];
      relationName: TForeignKeyParams['relationName'];
      toField: TForeignKeyParams['toField'];
    }
  > {
    return new this(params);
  }
}

type ExtractFieldNameOptionsOfModel<TProbablyAModel> = TProbablyAModel extends {
  new (...args: any): { fields: infer TFields };
}
  ? keyof TFields
  : string;

type ExtractTypeFromFieldOfAModel<
  TProbablyAModel,
  TToFieldName extends string,
  TTypeToExtract extends 'create' | 'update' | 'read' = 'create'
> = TProbablyAModel extends
  | { new (...args: any): { fields: infer TFields } }
  | (() => { new (...args: any): { fields: infer TFields } })
  ? TFields extends Record<any, Field<any, any> | AutoField<any, any> | ForeignKeyField<any, any>>
    ? TFields[TToFieldName] extends
        | Field<infer TType, any>
        | AutoField<infer TType, any>
        | ForeignKeyField<infer TType, any>
      ? TType[TTypeToExtract]
      : any
    : any
  : TProbablyAModel extends (args: infer TType) => { new (...args: any): any }
    ? TTypeToExtract extends keyof TType
      ? TType[TTypeToExtract]
      : any
    : any;

const BaseModel = define('BaseModel', {
  fields: {
    id: AutoField.new()
  }
});

const test = ForeignKeyField.new({
  relatedTo: () => BaseModel,
  toField: 'id',
  onDelete: ON_DELETE.CASCADE,
  relatedName: 'test',
  relationName: 'test'
});
