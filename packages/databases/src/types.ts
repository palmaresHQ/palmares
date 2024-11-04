import type { DatabaseAdapter } from './engine';
import type { BaseModel, Manager, Model, model } from './models';
import type {
  AutoField,
  BigAutoField,
  BigIntegerField,
  BooleanField,
  CharField,
  DateField,
  EnumField,
  Field,
  ForeignKeyField,
  IntegerField,
  TextField,
  UuidField
} from './models/fields';
import type { ExtractTypeFromField } from './models/fields/types';
import type { ModelType } from './models/model';
import type {
  CommonQuerySet,
  GetDataFromModel,
  GetQuerySet,
  QuerySet,
  RemoveQuerySet,
  SetQuerySet
} from './queries/queryset';
import type { EventEmitter } from '@palmares/events';

export interface DatabaseConfigurationType {
  engine: [any, () => DatabaseAdapter];
  events?: {
    emitter: EventEmitter | Promise<EventEmitter>;
    channels?: string[];
  };
}

export type ExtractFieldsFromAbstracts<TRootFields, TAbstracts extends readonly any[]> = TAbstracts extends readonly [
  infer TAbstract,
  ...infer TRest
]
  ? TAbstract extends {
      new (): { fields: infer TFields };
    }
    ? Omit<
        ExtractFieldsFromAbstracts<unknown, TRest extends readonly any[] ? TRest : []> & TFields & TRootFields,
        never
      >
    : TRootFields
  : TRootFields;

export type ExtractManagersFromAbstracts<TAbstracts extends readonly any[]> = TAbstracts extends readonly [
  infer TAbstract,
  ...infer TRest
]
  ? {
      [TKey in keyof TAbstract as TAbstract[TKey] extends Manager<any>
        ? TKey extends 'default'
          ? never
          : TKey
        : never]: TAbstract[TKey];
    } & ExtractManagersFromAbstracts<TRest extends readonly any[] ? TRest : []>
  : unknown;

export type InitializedEngineInstancesType = {
  [key: string]: InitializedEngineInstanceWithModelsType;
};

export type InitializedEngineInstanceWithModelsType = {
  engineInstance: DatabaseAdapter;
  projectModels: InitializedModelsType[];
};

export type FoundModelType = {
  domainName: string;
  domainPath: string;
  model: ModelType<any, any> & typeof Model & typeof BaseModel;
};

export type InitializedModelsType<TModel = any> = {
  domainName: string;
  domainPath: string;
  class: ModelType<any, any> & typeof Model & typeof BaseModel;
  initialized: TModel;
  original: InstanceType<ModelType<any, any>> & Model & BaseModel;
};

export type DatabaseSettingsType = {
  databases: {
    [key: string]: DatabaseConfigurationType;
  };
  eventEmitter?: EventEmitter;
  dismissNoMigrationsLog?: boolean;
};

export type OptionalMakemigrationsArgsType = {
  empty?: string;
  useTs?: boolean;
};

/** INFER */
// FIELDS
export type InferField<TField, TTypeToExtract extends 'create' | 'update' | 'read' = 'read'> = ExtractTypeFromField<
  TField,
  TTypeToExtract
>;

export type InferFieldDefinitions<TField> =
  TField extends AutoField<infer TType, infer TDefinitions>
    ? {
        type: TType;
        definitions: TDefinitions;
      }
    : TField extends BigAutoField<infer TType, infer TDefinitions>
      ? {
          type: TType;
          definitions: TDefinitions;
        }
      : TField extends BigIntegerField<infer TType, infer TDefinitions>
        ? {
            type: TType;
            definitions: TDefinitions;
          }
        : TField extends IntegerField<infer TType, infer TDefinitions>
          ? {
              type: TType;
              definitions: TDefinitions;
            }
          : TField extends BooleanField<infer TType, infer TDefinitions>
            ? {
                type: TType;
                definitions: TDefinitions;
              }
            : TField extends EnumField<infer TType, infer TDefinitions>
              ? {
                  type: TType;
                  definitions: TDefinitions;
                }
              : TField extends CharField<infer TType, infer TDefinitions>
                ? {
                    type: TType;
                    definitions: TDefinitions;
                  }
                : TField extends DateField<infer TType, infer TDefinitions>
                  ? {
                      type: TType;
                      definitions: TDefinitions;
                    }
                  : TField extends TextField<infer TType, infer TDefinitions>
                    ? {
                        type: TType;
                        definitions: TDefinitions;
                      }
                    : TField extends UuidField<infer TType, infer TDefinitions>
                      ? {
                          type: TType;
                          definitions: TDefinitions;
                        }
                      : TField extends ForeignKeyField<infer TType, infer TDefinitions>
                        ? {
                            type: TType;
                            definitions: TDefinitions;
                          }
                        : TField extends Field<infer TType, infer TDefinitions>
                          ? {
                              type: TType;
                              definitions: TDefinitions;
                            }
                          : never;

// MODELS

/**
 * This type is used to infer the model fields from a model instance.
 */
export type InferModel<TModel, TType extends 'create' | 'update' | 'read' = 'read'> = GetDataFromModel<
  TModel,
  TType,
  false
>;

/**
 * This will infer the definitions of the fields of a model and the model itself.
 *
 * This way you can create custom types above the models. For example: Kysely and others.
 */
export type InferModelDefinitions<TModel> = TModel extends
  | ModelType<{ fields: infer TFields; options?: infer TOptions }, any>
  | { fields: infer TFields; options?: infer TOptions }
  ? {
      fields: {
        [TKey in keyof TFields]: InferFieldDefinitions<TFields[TKey]>;
      };
      options: TOptions;
    }
  : never;

// MANAGERS
export type InferManagerAction<TFunction extends (...args: any[]) => any> = ReturnType<TFunction>;

// QUERYSET
/** Infers the result of a QuerySet so you can use it on your applications. */
export type InferQuerySetResult<TQuerySet> = TQuerySet extends
  | RemoveQuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
  | QuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
  | CommonQuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
  | GetQuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
  | SetQuerySet<any, any, infer TResult, any, any, any, any, any, any, any, any, any>
  ? TResult[]
  : never;
