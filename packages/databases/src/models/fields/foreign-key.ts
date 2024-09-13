import { ForeignKeyFieldRequiredParamsMissingError } from './exceptions';
import { Field } from './field';
import {
  type NewInstanceArgumentsCallback,
  type TCompareCallback,
  type TOptionsCallback,
  type ToStringCallback
} from './utils';
import { BigAutoField, IntegerField, define } from '../..';
import { generateUUID } from '../../utils';

import type {
  ClassConstructor,
  CustomImportsForFieldType,
  ExtractFieldNameOptionsOfModel,
  ExtractTypeFromFieldOfAModel,
  ON_DELETE
} from './types';
import type { AdapterFieldParser, ModelType } from '../..';
import type { DatabaseAdapter } from '../../engine';

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
    databaseName: string | undefined;
    engineInstance: DatabaseAdapter;
    customAttributes: any;
    relatedTo: TRelatedTo;
    onDelete: TForeignKeyParams['onDelete'];
    relatedName: TForeignKeyParams['relatedName'];
    relationName: TForeignKeyParams['relationName'];
    toField: TForeignKeyParams['toField'];
  }
> {
  return ForeignKeyField.new(params);
}

const getRelatedToAsString = (field: ForeignKeyField<any, any>) => {
  const relatedTo = field['__relatedTo'];
  const relatedToAsString = field['__relatedToAsString'];

  if (typeof relatedToAsString !== 'string') {
    if (typeof relatedTo === 'function') field['__relatedToAsString'] = relatedTo().getName();
    else if (typeof relatedTo === 'string') field['__relatedToAsString'] = relatedTo;
    else field['__relatedToAsString'] = relatedTo.getName();
  }
};

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
    databaseName: string | undefined;
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
    databaseName: string | undefined;
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
  protected __relatedToAsString?: string;
  protected __relatedTo: TDefinitions['relatedTo'];
  /** Preferably use __relatedTo, this is just to cache the model if `__relatedTo` is either a function or a string */
  protected __modelRelatedTo?: ClassConstructor<any>;
  protected __onDelete: TDefinitions['onDelete'];
  protected __relatedName: TDefinitions['relatedName'];
  protected __relationName: TDefinitions['relationName'];
  protected __toField: TDefinitions['toField'];
  protected __originalRelatedName?: string;
  protected static __inputParsers = new Map<string, Required<AdapterFieldParser>['inputParser']>();
  protected static __outputParsers = new Map<string, Required<AdapterFieldParser>['outputParser']>();

  /**
   * This is used internally by the engine to compare if the field is equal to another field.
   * You can override this if you want to extend the ForeignKeyField class.
   */
  protected static __compareCallback: TCompareCallback = (oldField, newField, defaultCompareCallback) => {
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

    const [isEqual, changedAttributes] = defaultCompareCallback(oldField, newField, defaultCompareCallback);
    if (!isRelatedToEqual) changedAttributes.push('relatedTo');
    if (!isToFieldEqual) changedAttributes.push('toField');
    if (!isOnDeleteEqual) changedAttributes.push('onDelete');
    if (!isRelationNameEqual) changedAttributes.push('relationName');
    if (!isRelatedNameEqual) changedAttributes.push('relatedName');

    return [
      isRelatedNameEqual && isRelatedToEqual && isToFieldEqual && isOnDeleteEqual && isRelationNameEqual && isEqual,
      changedAttributes
    ];
  };
  /**
   * This is used internally by the engine for cloning the field to a new instance.
   * By doing that you are able to get the constructor options of the field when using Field.new(<instanceArguments>)
   */
  protected static __newInstanceCallback: NewInstanceArgumentsCallback = (
    oldField,
    defaultNewInstanceArgumentsCallback
  ) => {
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
  };
  /**
   * This is used internally by the engine to convert the field to string.
   * You can override this if you want to extend the ForeignKeyField class.
   */
  protected static __toStringCallback: ToStringCallback = async (
    field,
    defaultToStringCallback,
    indentation = 0,
    _customParams = undefined
  ) => {
    const fieldAsForeignKey = field as ForeignKeyField<any, any>;
    const ident = '  '.repeat(indentation + 1);
    getRelatedToAsString(fieldAsForeignKey);
    return await defaultToStringCallback(
      field,
      defaultToStringCallback,
      indentation,
      `${ident}relatedTo: "${fieldAsForeignKey['__relatedToAsString']}",\n` +
        `${ident}toField: "${fieldAsForeignKey['__toField']}",\n` +
        `${ident}onDelete: models.fields.ON_DELETE.${fieldAsForeignKey['__onDelete'].toUpperCase()},\n` +
        `${ident}relationName: "${fieldAsForeignKey['__relationName']}",\n` +
        `${ident}relatedName: "${fieldAsForeignKey['__originalRelatedName']}",`
    );
  };

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
  async isRelatedModelFromEngineInstance(engineInstance: DatabaseAdapter): Promise<[boolean, Field?]> {
    getRelatedToAsString(this);
    const relatedToAsString = this['__relatedToAsString'] as string;
    const relatedModel = engineInstance.__modelsOfEngine[relatedToAsString] as any;
    let modelRelatedTo;

    if (typeof this['__relatedTo'] === 'function') modelRelatedTo = this['__relatedTo']();
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
    const modelConstructor = this['__model'] !== undefined ? (this['__model'].constructor as ModelType) : undefined;
    const isModelAStateModel = isModelDefined && modelConstructor?.isState === true;
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
      customAttributes: TDefinitions['customAttributes'];
    }
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
    }
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
      defaultValue: TDefinitions['defaultValue'];
      databaseName: TDefinitions['databaseName'];
      typeName: TDefinitions['typeName'];
      engineInstance: TDefinitions['engineInstance'];
      customAttributes: TDefinitions['customAttributes'] & TCustomPartialAttributes;
    }
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
    return newField;
  }

  init(fieldName: string, model: ModelType) {
    getRelatedToAsString(this);
    const isRelatedToAndOnDeleteNotDefined =
      typeof this['__relatedToAsString'] !== 'string' && typeof this['__onDelete'] !== 'string';
    const relatedToAsString = this['__relatedToAsString'] as string;
    const originalNameOfModel = model.originalName();

    if (isRelatedToAndOnDeleteNotDefined) throw new ForeignKeyFieldRequiredParamsMissingError(this['__fieldName']);

    const modelAssociations = model.associations as any;
    const hasNotIncludesAssociation =
      (modelAssociations[relatedToAsString] || []).some(
        (association: Field<any, any>) => association['__fieldName'] === fieldName
      ) === false;
    if (hasNotIncludesAssociation) {
      model.associations[relatedToAsString] = modelAssociations[relatedToAsString] || [];
      model.associations[relatedToAsString].push(this);
    }

    const modelDirectlyRelatedTo = model.directlyRelatedTo as any;
    // Appends to the model the other models this model is related to.
    model.directlyRelatedTo[relatedToAsString] = modelDirectlyRelatedTo[relatedToAsString] || [];
    model.directlyRelatedTo[relatedToAsString].push(this['__relationName']);

    // this will update the indirectly related models of the engine instance.
    // This means that for example, if the Post model has a foreign key to the User model
    // There is no way for the User model to know that it is related to the Post model.
    // Because of this we update this value on the engine instance. Updating the array on the engine instance
    // will also reflect on the `relatedTo` array in the model instance.
    if (this['__originalRelatedName']) {
      // eslint-disable-next-line ts/no-unnecessary-condition
      model.indirectlyRelatedModels[relatedToAsString] = model.indirectlyRelatedModels?.[relatedToAsString] || {};
      model.indirectlyRelatedModels[relatedToAsString][originalNameOfModel] =
        (model.indirectlyRelatedModels as any)?.[relatedToAsString]?.[originalNameOfModel] || [];
      model.indirectlyRelatedModels[relatedToAsString][originalNameOfModel].push(this['__originalRelatedName']);
    }

    super.init(fieldName, model);

    const wasRelatedNameDefined: boolean = typeof this['__relatedName'] === 'string';

    if (wasRelatedNameDefined === false) {
      const relatedToWithFirstStringLower: string =
        relatedToAsString.charAt(0).toLowerCase() + relatedToAsString.slice(1);
      const originalModelNameWithFirstStringUpper: string =
        originalNameOfModel.charAt(0).toUpperCase() + originalNameOfModel.slice(1);
      this['__originalRelatedName'] = `${relatedToWithFirstStringLower}${originalModelNameWithFirstStringUpper}s`;
    }

    // eslint-disable-next-line ts/no-unnecessary-condition
    model.indirectlyRelatedModels.$set?.[relatedToAsString]?.();
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
      databaseName: string | undefined;
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
