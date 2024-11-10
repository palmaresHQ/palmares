import {
  ForeignKeyFieldInvalidRelatedToError,
  ForeignKeyFieldRelatedOrRelationNameAlreadyExistsError,
  ForeignKeyFieldRequiredParamsMissingError
} from './exceptions';
import { Field } from './field';
import { getRelatedToAsString } from './utils';
import { BigAutoField, IntegerField } from '../..';
import { generateUUID } from '../../utils';
import { type BaseModel, type Model, type ModelType } from '../model';

import type {
  CustomImportsForFieldType,
  ExtractFieldNameOptionsOfModel,
  ExtractFieldOperationTypeForSearch,
  ExtractTypeFromFieldOfAModel,
  FieldWithOperationTypeForSearch,
  ON_DELETE
} from './types';
import type {
  CompareCallback,
  GetArgumentsCallback,
  NewInstanceArgumentsCallback,
  OptionsCallback,
  ToStringCallback
} from './utils';
import type { DatabaseAdapter } from '../../engine';
import type { AdapterFieldParser } from '../../engine/fields/field';

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
 */
export function foreignKey<
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
    create: TRelatedTo extends () => any
      ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>
      : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
        ? TRelatedTo extends (_: { create: infer TCreate; read: any; update: any }) => any
          ? TCreate
          : never
        : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>;
    read: TRelatedTo extends () => any
      ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>
      : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
        ? TRelatedTo extends (_: { create: any; read: infer TRead; update: any }) => any
          ? TRead
          : never
        : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>;
    update: TRelatedTo extends () => any
      ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>
      : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
        ? TRelatedTo extends (_: { create: any; read: any; update: infer TUpdate }) => any
          ? TUpdate
          : never
        : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>;
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
    databaseName: string | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    hasDefaultValue: false;
    relatedTo: TRelatedTo;
    onDelete: TForeignKeyParams['onDelete'];
    relatedName: TForeignKeyParams['relatedName'];
    relationName: TForeignKeyParams['relationName'];
    toField: TForeignKeyParams['toField'];
  },
  ExtractFieldOperationTypeForSearch<TRelatedTo, TForeignKeyParams['toField']>
> {
  return ForeignKeyField.new(params) as unknown as any;
}

/**
 * This type of field is special and is supposed to hold foreign key references to another field of another model.
 * Usually in relational databases like postgres we can have related fields like `user_id` inside of the table `posts`.
 * What this means that each value in the column `user_id` is one of the ids of the `users` table. This means that we
 * can use this value to join them together.
 *
 * We don't offer stuff like Many-to-many or many-to-one or one-to-one relations by default, the user needs to model it
 * themselves. This is because we want to keep the library as simple as possible.
 */
export class ForeignKeyField<
  out TType extends { create: any; read: any; update: any } = { create: any; read: any; update: any },
  out TDefinitions extends {
    unique: boolean;
    auto: boolean;
    allowNull: boolean;
    dbIndex: boolean;
    isPrimaryKey: boolean;
    defaultValue: any;
    underscored: boolean;
    typeName: string;
    databaseName: string | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    relatedTo: any;
    onDelete: ON_DELETE;
    relatedName: string;
    relationName: string;
    hasDefaultValue: boolean;
    toField: string;
  } = {
    unique: false;
    auto: false;
    allowNull: false;
    dbIndex: false;
    isPrimaryKey: false;
    defaultValue: any;
    underscored: false;
    typeName: string;
    hasDefaultValue: false;
    databaseName: string | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    relatedTo: any;
    onDelete: ON_DELETE;
    relatedName: string;
    relationName: string;
    toField: string;
  },
  out TFieldOperationTypes = FieldWithOperationTypeForSearch<any>
> extends Field<TType, TDefinitions, TFieldOperationTypes> {
  protected $$type = '$PForeignKeyField';
  protected __typeName = 'ForeignKeyField';
  protected __relatedToAsString?: string;
  protected __relatedTo: TDefinitions['relatedTo'];
  /** Preferably use __relatedTo, this is just to cache the model if `__relatedTo` is either a function or a string */
  protected __modelRelatedTo?: {
    new (...args: unknown[]): any;
  };
  protected __allowedQueryOperations: Set<any> = new Set([] as (keyof Required<TFieldOperationTypes>)[]);
  protected __onDelete: TDefinitions['onDelete'];
  protected __relatedName: TDefinitions['relatedName'];
  protected __relationName: TDefinitions['relationName'];
  protected __toField: TDefinitions['toField'];
  protected __originalRelatedName?: string;
  protected __inputParsers = new Map<string, Required<AdapterFieldParser>['inputParser']>();
  protected __outputParsers = new Map<string, Required<AdapterFieldParser>['outputParser']>();

  /**
   * This is used internally by the engine to compare if the field is equal to another field.
   * You can override this if you want to extend the ForeignKeyField class.
   */
  protected __compareCallback = ((engine, oldField, newField, defaultCompareCallback) => {
    const oldFieldAsForeignKey = oldField as ForeignKeyField<any, any>;
    const newFieldAsForeignKey = newField as ForeignKeyField<any, any>;
    getRelatedToAsString(oldFieldAsForeignKey);
    getRelatedToAsString(newFieldAsForeignKey);
    const isRelatedToEqual =
      oldFieldAsForeignKey['__relatedToAsString'] === newFieldAsForeignKey['__relatedToAsString'];
    const isToFieldEqual = oldFieldAsForeignKey['__toField'] === newFieldAsForeignKey['__toField'];
    const isOnDeleteEqual = oldFieldAsForeignKey['__onDelete'] === newFieldAsForeignKey['__onDelete'];
    const isRelationNameEqual = oldFieldAsForeignKey['__relationName'] === newFieldAsForeignKey['__relationName'];
    const isRelatedNameEqual = oldFieldAsForeignKey['__relatedName'] === newFieldAsForeignKey['__relatedName'];

    const [isEqual, changedAttributes] = defaultCompareCallback(engine, oldField, newField, defaultCompareCallback);
    if (!isRelatedToEqual) changedAttributes.push('relatedTo');
    if (!isToFieldEqual) changedAttributes.push('toField');
    if (!isOnDeleteEqual) changedAttributes.push('onDelete');
    if (!isRelationNameEqual) changedAttributes.push('relationName');
    if (!isRelatedNameEqual) changedAttributes.push('relatedName');

    return [
      isRelatedNameEqual && isRelatedToEqual && isToFieldEqual && isOnDeleteEqual && isRelationNameEqual && isEqual,
      changedAttributes
    ];
  }) satisfies CompareCallback;

  /**
   * This is used internally by the engine for cloning the field to a new instance.
   * By doing that you are able to get the constructor options of the field when using Field.new(<instanceArguments>)
   */
  protected __newInstanceCallback = ((oldField, defaultNewInstanceArgumentsCallback) => {
    const defaultData = defaultNewInstanceArgumentsCallback(oldField, defaultNewInstanceArgumentsCallback);
    const position0 = defaultData[0] || {};
    const otherPositions = defaultData.slice(1);
    const asForeignKeyField = oldField as ForeignKeyField<any, any>;
    return [
      {
        ...position0,
        relatedTo: asForeignKeyField['__relatedTo'],
        onDelete: asForeignKeyField['__onDelete'],
        relatedName: asForeignKeyField['__relatedName'],
        relationName: asForeignKeyField['__relationName'],
        toField: asForeignKeyField['__toField']
      },
      ...otherPositions
    ];
  }) satisfies NewInstanceArgumentsCallback;

  /**
   * This is used internally by the engine to convert the field to string.
   * You can override this if you want to extend the ForeignKeyField class.
   */
  protected __toStringCallback = (async (engine, field, defaultToStringCallback, _customParams = undefined) => {
    const fieldAsForeignKey = field as ForeignKeyField<any, any, any>;
    getRelatedToAsString(fieldAsForeignKey);
    return await defaultToStringCallback(engine, field, defaultToStringCallback, {
      constructorParams:
        `{` +
        `relatedTo: "${fieldAsForeignKey['__relatedToAsString']}", ` +
        `toField: "${fieldAsForeignKey['__toField']}", ` +
        `onDelete: models.fields.ON_DELETE.${fieldAsForeignKey['__onDelete'].toUpperCase()}, ` +
        `relationName: "${fieldAsForeignKey['__relationName']}", ` +
        `relatedName: "${fieldAsForeignKey['__originalRelatedName']}"` +
        `}`
    });
  }) satisfies ToStringCallback;

  protected __getArgumentsCallback = ((field, defaultCallback) => {
    const fieldAsForeignKeyField = field as ForeignKeyField<any, any, any>;
    const relatedTo = fieldAsForeignKeyField['__relatedToAsString'];
    const toField = fieldAsForeignKeyField['__toField'];
    const relationName = fieldAsForeignKeyField['__relationName'];
    const relatedName = fieldAsForeignKeyField['__relatedName'];
    const onDelete = fieldAsForeignKeyField['__onDelete'];

    return {
      ...defaultCallback(field, defaultCallback),
      toField,
      relatedTo: relatedTo as string,
      relationName,
      relatedName,
      onDelete: onDelete as ON_DELETE
    };
  }) satisfies GetArgumentsCallback;

  constructor({
    onDelete,
    relatedName,
    relatedTo,
    relationName,
    toField,
    ...rest
  }: Pick<TDefinitions, 'relatedTo' | 'onDelete' | 'relatedName' | 'relationName' | 'toField'>) {
    super(rest);
    this.__relatedTo = relatedTo;
    this.__onDelete = onDelete;
    this.__relatedName = relatedName;
    this.__relationName = relationName;
    this.__toField = toField;
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
   * @returns - Returns an array where the first item is if the relatedModel is
   * from the engine instance (false if not) and the field it should change to.
   */
  async isRelatedModelFromEngineInstance(engineInstance: DatabaseAdapter): Promise<[boolean, Field<any, any, any>?]> {
    getRelatedToAsString(this);
    const relatedToAsString = this['__relatedToAsString'] as string;
    const relatedModel = engineInstance.__modelsOfEngine[relatedToAsString] as any;
    let modelRelatedTo;

    if (typeof this['__relatedTo'] === 'function' && this['__relatedTo']?.['$$type'] !== '$PModel')
      modelRelatedTo = this['__relatedTo']();
    else if (typeof this['__relatedTo'] === 'string')
      modelRelatedTo = engineInstance.__modelsOfEngine[this['__relatedTo']];
    else modelRelatedTo = this['__relatedTo'];

    if (this['__modelRelatedTo'] === undefined) this['__modelRelatedTo'] = modelRelatedTo;

    if (relatedModel !== undefined) return [true, undefined];
    else {
      const modelRelatedTo = engineInstance.__modelsFilteredOutOfEngine[relatedToAsString] as any;
      if (modelRelatedTo === undefined) return [true, undefined];
      else {
        const modelInstance = new modelRelatedTo();
        const fieldRelatedTo = modelInstance.fields[this['__toField']];
        let clonedField: Field<any, any>;
        if (fieldRelatedTo.$$type === '$PAutoField') clonedField = IntegerField.new() as unknown as Field<any, any>;
        if (fieldRelatedTo.$$type === '$PBigAutoField') clonedField = BigAutoField.new() as unknown as Field<any, any>;
        else clonedField = (await fieldRelatedTo.clone()) as Field<any, any>;
        clonedField['__model'] = this['__model'];
        clonedField['__fieldName'] = this['__fieldName'];
        clonedField['__databaseName'] = this['__databaseName'] as undefined;
        clonedField['__defaultValue'] = this['__defaultValue'];
        clonedField['__allowNull'] = this['__allowNull'];
        clonedField['__dbIndex'] = this['__dbIndex'];
        clonedField['__hasDefaultValue'] = this['__hasDefaultValue'];
        clonedField['__underscored'] = this['__underscored'];
        clonedField['__unique'] = this['__unique'];
        clonedField['__isAuto'] = false;
        clonedField['__primaryKey'] = false;
        modelInstance.fields[this['__fieldName']] = clonedField;
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
   */
  protected get _relatedName() {
    const isModelDefined = (this['__model'] as any) !== undefined;
    const modelConstructor =
      this['__model'] !== undefined
        ? (this['__model'].constructor as ModelType<any, any> & typeof BaseModel & typeof Model)
        : undefined;
    const isModelAStateModel = isModelDefined && modelConstructor?.['__isState'] === true;
    if (isModelAStateModel) return `${generateUUID()}-${this.__originalRelatedName}`;
    else return this.__originalRelatedName;
  }

  /**
   * Supposed to be used by library maintainers.
   *
   * When you custom create a field, you might want to take advantage of the builder pattern we already support.
   * This let's you create functions that can be chained together to create a new field. It should be used
   * alongside the `_setPartialAttributes` method like
   *
   * @example
   * ```ts
   * const customBigInt = TextField.overrideType<
   *   { create: bigint; read: bigint; update: bigint },
   *   {
   *       customAttributes: { name: string };
   *       unique: boolean;
   *       auto: boolean;
   *       allowNull: true;
   *       dbIndex: boolean;
   *       isPrimaryKey: boolean;
   *       defaultValue: any;
   *       typeName: string;
   *       engineInstance: DatabaseAdapter;
   *   }
   * >({
   *   typeName: 'CustomBigInt'
   * });
   *
   * const customBuilder = <TParams extends { name: string }>(params: TParams) => {
   *   const field = customBigInt.new(params);
   *   return field._setNewBuilderMethods({
   *     test: <TTest extends { age: number }>(param: TTest) =>
   *        // This will union the type `string` with what already exists in the field 'create' type
   *        field._setPartialAttributes<{ create: string }, { create: 'union' }>(param)
   *   });
   * };
   *
   * // Then your user can use it like:
   *
   * const field = customBuilder({ name: 'test' }).test({ age: 2 });
   * ```
   *
   * **Important**: `customBuilder` will be used by the end user and you are responsible for documenting it.
   */
  _setNewBuilderMethods<const TFunctions extends InstanceType<any>>(
    functions?: TFunctions
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
    },
    TFieldOperationTypes
  > &
    TFunctions {
    if (functions === undefined) return this as any;
    const propertiesOfBase = Object.getOwnPropertyNames(Object.getPrototypeOf(functions));
    for (const key of propertiesOfBase) {
      if (key === 'constructor') continue;
      (this as any)[key] = (functions as any)[key].bind(this);
    }

    return this as any;
  }

  /**
   * FOR LIBRARY MAINTAINERS ONLY
   *
   * Focused for library maintainers that want to support a custom field type not supported by palmares.
   * This let's them partially update the custom attributes of the field. By default setCustomAttributes
   * will override the custom attributes entirely.
   */
  _setPartialAttributes<
    TNewType extends { create?: any; read?: any; update?: any },
    TActions extends {
      create?: 'merge' | 'union' | 'replace';
      read?: 'merge' | 'union' | 'replace';
      update?: 'merge' | 'union' | 'replace';
    },
    TNewAllowedQueryOperations extends FieldWithOperationTypeForSearch<
      TActions['read'] extends 'merge'
        ? TType['read'] & TNewType['read']
        : TActions['read'] extends 'union'
          ? TType['read'] | TNewType['read']
          : TActions['read'] extends 'replace'
            ? TNewType['read']
            : TType['read']
    > = Pick<
      FieldWithOperationTypeForSearch<TType['read'] | null | undefined>,
      keyof TFieldOperationTypes extends keyof FieldWithOperationTypeForSearch<TType['read'] | null | undefined>
        ? keyof TFieldOperationTypes
        : never
    >
  >(): <const TCustomPartialAttributes>(partialCustomAttributes: TCustomPartialAttributes) => ForeignKeyField<
    {
      create: TActions['create'] extends 'merge'
        ? TType['create'] & TNewType['create']
        : TActions['create'] extends 'union'
          ? TType['create'] | TNewType['create']
          : TActions['create'] extends 'replace'
            ? TNewType['create']
            : TType['create'];
      read: TActions['read'] extends 'merge'
        ? TType['read'] & TNewType['read']
        : TActions['read'] extends 'union'
          ? TType['read'] | TNewType['read']
          : TActions['read'] extends 'replace'
            ? TNewType['read']
            : TType['read'];
      update: TActions['update'] extends 'merge'
        ? TType['update'] & TNewType['update']
        : TActions['update'] extends 'union'
          ? TType['update'] | TNewType['update']
          : TActions['update'] extends 'replace'
            ? TNewType['update']
            : TType['update'];
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
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'] & TCustomPartialAttributes;
    },
    TNewAllowedQueryOperations
  > {
    return (partialCustomAttributes) => {
      if (partialCustomAttributes !== undefined) {
        if ((this.__customAttributes as any) === undefined) this.__customAttributes = {} as any;
        this.__customAttributes = { ...this.__customAttributes, ...partialCustomAttributes };
      }
      return this as any;
    };
  }

  setCustomAttributes<
    const TCustomAttributes extends Parameters<
      TDefinitions['engineInstance']['fields']['foreignKeyFieldParser']['translate']
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
      customAttributes: TCustomAttributes;
    },
    TFieldOperationTypes
  > {
    (this.__customAttributes as any) = customAttributes as any;

    return this as unknown as any;
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
        | 'hasDefaultValue'
      >]: TDefinitions[TKey];
    } & {
      unique: TUnique extends false ? false : true;
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    },
    TFieldOperationTypes
  > {
    return super.unique(isUnique) as unknown as any;
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
      unique: TDefinitions['unique'];
      allowNull: TNull extends false ? false : true;
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    } & {
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
        | 'hasDefaultValue'
      >]: TDefinitions[TKey];
    },
    Pick<
      FieldWithOperationTypeForSearch<TType['read'] | null | undefined>,
      keyof TFieldOperationTypes extends keyof FieldWithOperationTypeForSearch<TType['read'] | null | undefined>
        ? keyof TFieldOperationTypes
        : never
    >
  > {
    return super.allowNull(isNull) as unknown as any;
  }

  /**
   * This method is used to create an index on the database for this field.
   */
  dbIndex<TDbIndex extends boolean = true>(
    isDbIndex?: TDbIndex
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
        | 'hasDefaultValue'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDbIndex extends false ? false : true;
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    },
    TFieldOperationTypes
  > {
    return super.dbIndex(isDbIndex) as unknown as any;
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TUnderscored extends false ? false : true;
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    },
    TFieldOperationTypes
  > {
    return super.underscored(isUnderscored) as unknown as any;
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TIsPrimaryKey extends false ? false : true;
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    },
    TFieldOperationTypes
  > {
    return super.primaryKey(isPrimaryKey) as unknown as any;
  }

  auto<TIsAuto extends boolean = true>(
    isAuto?: TIsAuto
  ): ForeignKeyField<
    {
      create: TType['create'] | undefined;
      read: TType['read'];
      update: TType['update'] | undefined;
    },
    {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TIsAuto extends false ? false : true;
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    } & {
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    },
    TFieldOperationTypes
  > {
    return super.auto(isAuto) as unknown as any;
  }

  default<TDefault extends TType['create']>(
    defaultValue: TDefault
  ): ForeignKeyField<
    {
      create: TType['create'] | TDefault | undefined;
      read: TType['read'];
      update: TType['update'] | undefined;
    },
    {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefault;
      hasDefaultValue: true;
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    } & {
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    },
    TFieldOperationTypes
  > {
    return super.default(defaultValue) as unknown as any;
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
        | 'hasDefaultValue'
        | 'allowedQueryOperations'
      >]: TDefinitions[TKey];
    } & {
      unique: TDefinitions['unique'];
      allowNull: TDefinitions['allowNull'];
      dbIndex: TDefinitions['dbIndex'];
      underscored: TDefinitions['underscored'];
      isPrimaryKey: TDefinitions['isPrimaryKey'];
      auto: TDefinitions['auto'];
      defaultValue: TDefinitions['defaultValue'];
      hasDefaultValue: TDefinitions['hasDefaultValue'];
      databaseName: TDatabaseName;
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'];
      relatedTo: TDefinitions['relatedTo'];
      relationName: TDefinitions['relationName'];
      relatedName: TDefinitions['relatedName'];
      onDelete: TDefinitions['onDelete'];
      toField: TDefinitions['toField'];
    },
    TFieldOperationTypes
  > {
    return super.databaseName(databaseName) as unknown as any;
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
  static _overrideType<
    const TDefinitions extends {
      customAttributes: any;
      unique: boolean;
      auto: boolean;
      allowNull: boolean;
      dbIndex: boolean;
      isPrimaryKey: boolean;
      defaultValue: any;
      typeName: string;
      engineInstance: DatabaseAdapter;
    } & Record<string, any>,
    const _TFieldOperationTypes extends
      | FieldWithOperationTypeForSearch<any>
      | Pick<FieldWithOperationTypeForSearch<any>, any>
  >(args: {
    typeName: string;
    toStringCallback?: ToStringCallback;
    compareCallback?: CompareCallback;
    optionsCallback?: OptionsCallback;
    newInstanceCallback?: NewInstanceArgumentsCallback;
    allowedQueryOperations?: (keyof TDefinitions['allowedQueryOperations'])[];
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
            hasDefaultValue: TDefinitions['hasDefaultValue'];
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
            relatedTo: TRelatedTo;
            onDelete: TForeignKeyParams['onDelete'];
            relatedName: TForeignKeyParams['relatedName'];
            relationName: TForeignKeyParams['relationName'];
            toField: TForeignKeyParams['toField'];
          },
          ExtractFieldOperationTypeForSearch<TRelatedTo, TForeignKeyParams['toField']>
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
            hasDefaultValue: TDefinitions['hasDefaultValue'];
            databaseName: string | undefined;
            engineInstance: TDefinitions['engineInstance'];
            customAttributes: TDefinitions['customAttributes'];
            typeName: TDefinitions['typeName'];
            relatedTo: TRelatedTo;
            onDelete: TForeignKeyParams['onDelete'];
            relatedName: TForeignKeyParams['relatedName'];
            relationName: TForeignKeyParams['relationName'];
            toField: TForeignKeyParams['toField'];
          },
          ExtractFieldOperationTypeForSearch<TRelatedTo, TForeignKeyParams['toField']>
        >;
      } {
    const newField = super._overrideType(args) as any;
    // We remove the data needed for ForeignKeyField
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
    return newField;
  }

  /**
   * This is quite confusing, i know.
   *
   * This method is used to keep track of the relation on models. I won't go too far. Let's use an example:
   *
   * @example ```typescript
   * const User = models.initialize('User', {
   *   fields: {
   *     id: AutoField.new(),
   *     name: CharField.new(),
   *     email: CharField.new(),
   *     profileId: ForeignKeyField.new({
   *       relatedTo: 'Profile',
   *       toField: 'id',
   *       relatedName: 'profileOfUsers',
   *       relationName: 'profile',
   *       onDelete: 'CASCADE'
   *     })
   *  }
   * });
   *
   * const Profile = models.initialize('Profile', {
   *  fields: {
   *   id: AutoField.new(),
   *   name: CharField.new(),
   *  }
   * });
   * ```
   *
   * On this example, the `profileId` field on the `User` model is related to the `Profile` model.
   * __directlyRelatedTo is an object that keeps track of the models that are directly related to the model.
   * In this case, the `User` model is directly related to the `Profile` model.
   * This means we should update the `User` model to keep track of the `Profile` model.
   *
   * __indirectlyRelatedTo is an object that keeps track of the models that are indirectly related to the model.
   * In this case, the `Profile` model is indirectly related to the `User` model.
   * This means we should update the `Profile` model to keep track of the `User` model.
   *
   * __associations is an object that keeps track of the fields that are related to the model. It's two way.
   * So the `Profile` model keeps track of all it's associations with other models. Wether Profile defined the
   * relation or not.
   *
   * With this configuration, no matter which model we have "in hands" we can always keep track of all of the relations.
   * It's confusing because at the end of the day it'll look like a complex graph.
   */
  protected __attachRelationsToModel(
    _field: ForeignKeyField<any, any, any>,
    fieldName: string,
    modelOfField: ModelType<any, any> & typeof Model & typeof BaseModel,
    relatedModel: string | (ModelType<any, any> & typeof Model & typeof BaseModel)
  ) {
    const modelOfFieldName = modelOfField['__originalName']();
    const relatedModelName = typeof relatedModel === 'string' ? relatedModel : relatedModel['__originalName']();
    const modelAssociations = modelOfField['__associations'];
    if (typeof modelAssociations !== 'object') modelOfField['__associations'] = {};

    // eslint-disable-next-line ts/no-unnecessary-condition
    modelOfField['__associations'][relatedModelName] = modelAssociations[relatedModelName] || {
      byRelatedName: new Map(),
      byRelationName: new Map()
    };
    const doesRelationAlreadyExistForRelatedName = modelOfField['__associations'][relatedModelName].byRelatedName.has(
      this['__relatedName']
    );
    const doesRelationAlreadyExistForRelationName = modelOfField['__associations'][relatedModelName].byRelationName.has(
      this['__relationName']
    );
    const doesRelatedTiesToADifferentField =
      modelOfField['__associations'][relatedModelName].byRelatedName.get(this['__relatedName']) !== this;
    const doesRelationTiesToADifferentField =
      modelOfField['__associations'][relatedModelName].byRelationName.get(this['__relationName']) !== this;

    if (doesRelationAlreadyExistForRelatedName && doesRelatedTiesToADifferentField) {
      const relatedField = modelOfField['__associations'][relatedModelName].byRelatedName.get(
        this['__relatedName']
      ) as ForeignKeyField<any, any, any>;
      throw new ForeignKeyFieldRelatedOrRelationNameAlreadyExistsError(
        modelOfFieldName,
        fieldName,
        this['__relatedName'],
        relatedField['__fieldName'],
        relatedField['__model']?.['__getName']?.() as string,
        true
      );
    }
    if (doesRelationAlreadyExistForRelationName && doesRelationTiesToADifferentField) {
      const relatedField = modelOfField['__associations'][relatedModelName].byRelationName.get(
        this['__relationName']
      ) as ForeignKeyField<any, any, any>;
      throw new ForeignKeyFieldRelatedOrRelationNameAlreadyExistsError(
        modelOfFieldName,
        fieldName,
        this['__relationName'],
        relatedField['__fieldName'],
        relatedField['__model']?.['__getName']?.() as string,
        false
      );
    }
    modelOfField['__associations'][relatedModelName].byRelatedName.set(this['__relatedName'], this);
    modelOfField['__associations'][relatedModelName].byRelationName.set(this['__relationName'], this);

    if (typeof modelOfField['__directlyRelatedTo'] !== 'object') modelOfField['__directlyRelatedTo'] = {};
    const modelDirectlyRelatedTo = modelOfField['__directlyRelatedTo'] as any;
    // Appends to the model the other models this model is related to.
    modelOfField['__directlyRelatedTo'][relatedModelName] = modelDirectlyRelatedTo[relatedModelName] || [];
    modelOfField['__directlyRelatedTo'][relatedModelName].push(this['__relationName']);

    if (typeof relatedModel !== 'string') {
      if (typeof relatedModel['__indirectlyRelatedTo'] !== 'object') relatedModel['__indirectlyRelatedTo'] = {};
      const modelDirectlyRelatedTo = relatedModel['__indirectlyRelatedTo'] as any;
      // Appends to the model the other models this model is related to.
      relatedModel['__indirectlyRelatedTo'][relatedModelName] = modelDirectlyRelatedTo[relatedModelName] || [];
      relatedModel['__indirectlyRelatedTo'][relatedModelName].push(this['__relatedName']);

      if (typeof relatedModel['__associations'] !== 'object') relatedModel['__associations'] = {};
      const relatedModelAssociations = relatedModel['__associations'] as any;
      if (typeof relatedModelAssociations[modelOfFieldName] !== 'object')
        relatedModelAssociations[modelOfFieldName] = { byRelatedName: new Map(), byRelationName: new Map() };
      relatedModelAssociations[modelOfFieldName].byRelatedName.set(this['__relatedName'], this);
      relatedModelAssociations[modelOfFieldName].byRelationName.set(this['__relationName'], this);
    }
  }

  protected __init(fieldName: string, model: ModelType<any, any> & typeof Model & typeof BaseModel): void {
    getRelatedToAsString(this);
    const isRelatedToAndOnDeleteNotDefined =
      typeof this['__relatedToAsString'] !== 'string' && typeof this['__onDelete'] !== 'string';
    const relatedToAsString = this['__relatedToAsString'] as string;
    const originalNameOfModel = model['__originalName']();

    if (typeof this['__relatedTo'] === 'function' && this['__relatedTo']?.['$$type'] !== '$PModel')
      this.__attachRelationsToModel(this, fieldName, model, this['__relatedTo']());
    else if (typeof this['__relatedTo'] === 'string') {
      // If it's a string we attach a callback to the model to attach the relations after all models are loaded.
      // This is tied to the `initializeModels` function.
      // Why don't use a global callback? Two engines might have the same model name.
      // It'll be a lot harder to debug. This just let us keep track while the model is being translated.
      // So, one engine at a time
      model['__callAfterAllModelsAreLoadedToSetupRelations'].set(
        `${fieldName}${model['__getName']()}`,
        (engineInstance) => {
          this.__attachRelationsToModel(
            this,
            fieldName,
            model,
            // eslint-disable-next-line ts/no-unnecessary-type-assertion
            engineInstance['__modelsOfEngine'][this['__relatedTo'] as string] as any
          );
        }
      );
    } else if (this['$$type'] === '$PModel') this.__attachRelationsToModel(this, fieldName, model, this['__relatedTo']);
    else throw new ForeignKeyFieldInvalidRelatedToError(fieldName, model['__originalName']());

    if (isRelatedToAndOnDeleteNotDefined) throw new ForeignKeyFieldRequiredParamsMissingError(this['__fieldName']);

    super.__init(fieldName, model);

    const wasRelatedNameDefined: boolean = typeof this['__relatedName'] === 'string';

    if (wasRelatedNameDefined === false) {
      const relatedToWithFirstStringLower: string =
        relatedToAsString.charAt(0).toLowerCase() + relatedToAsString.slice(1);
      const originalModelNameWithFirstStringUpper: string =
        originalNameOfModel.charAt(0).toUpperCase() + originalNameOfModel.slice(1);
      this['__originalRelatedName'] = `${relatedToWithFirstStringLower}${originalModelNameWithFirstStringUpper}s`;
    }
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
      create: TRelatedTo extends () => any
        ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>
        : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
          ? TRelatedTo extends (_: { create: infer TCreate; read: any; update: any }) => any
            ? TCreate
            : never
          : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'create'>;
      read: TRelatedTo extends () => any
        ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>
        : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
          ? TRelatedTo extends (_: { create: any; read: infer TRead; update: any }) => any
            ? TRead
            : never
          : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'read'>;
      update: TRelatedTo extends () => any
        ? ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>
        : TRelatedTo extends (_: { create: any; read: any; update: any }) => any
          ? TRelatedTo extends (_: { create: any; read: any; update: infer TUpdate }) => any
            ? TUpdate
            : never
          : ExtractTypeFromFieldOfAModel<TRelatedTo, TForeignKeyParams['toField'], 'update'>;
    },
    {
      onDelete: TForeignKeyParams['onDelete'];
      relatedName: TForeignKeyParams['relatedName'];
      relationName: TForeignKeyParams['relationName'];
      toField: TForeignKeyParams['toField'];
      unique: false;
      auto: false;
      allowNull: false;
      dbIndex: false;
      isPrimaryKey: false;
      defaultValue: any;
      hasDefaultValue: false;
      underscored: true;
      typeName: string;
      databaseName: string | undefined;
      engineInstance: DatabaseAdapter;
      customAttributes: any;
      relatedTo: TRelatedTo;
    },
    ExtractFieldOperationTypeForSearch<TRelatedTo, TForeignKeyParams['toField']>
  > {
    return new this(params) as any;
  }
}
