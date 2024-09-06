import type { FieldsOFModelType, ModelFieldsInQueries } from './queries';
import type { DatabaseAdapter } from '../../engine';
import type { DatabaseSettingsType } from '../../types';
import type { Field } from '../fields';
import type { Manager } from '../manager';
import type { BaseModel, Model } from '../model';

export type ModelType = typeof BaseModel & typeof Model;

export type ManagerInstancesType = {
  [engineName: string]: {
    instance: any;
    modifyItself: () => void;
  };
};

export type ManagerEngineInstancesType = {
  [engineName: string]: DatabaseAdapter;
};

export type ModelFieldsType = {
  [fieldName: string | symbol]: Field<any, any, any, any, any, any, any, any>;
};

export type ManagersOfInstanceType = {
  [key: string]: Manager;
};

export type ModelIndexType<TFields> = {
  unique: boolean;
  fields: TFields;
};

type OrderingOfModelOptions<TFields> =
  | `-${TFields extends readonly any[] ? TFields[number] : never}`[]
  | TFields
  | string[];

export type ExtractFieldNames<TFieldsAndAbstracts, TModelAbstracts> = TFieldsAndAbstracts extends {
  fields: infer TFields;
}
  ?
      | keyof TFields
      | (TModelAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
          ? TAbstract extends { fields: any } | { fields: any }
            ?
                | ExtractFieldNames<TAbstract, []>
                | ExtractFieldNames<
                    TFieldsAndAbstracts,
                    TRestAbstracts extends { fields: any } | { fields: any; abstracts: readonly any[] }
                      ? TRestAbstracts
                      : never[]
                  >
            : never
          : never)
  : never;

type ExtractFieldTypes<
  TFieldsAndAbstracts,
  TModelAbstracts,
  TIsAllOptional extends boolean = false
> = TFieldsAndAbstracts extends { fields: infer TFields }
  ? (TIsAllOptional extends true
      ? {
          [TFieldName in keyof TFields]?: '_type' extends keyof TFields[TFieldName]
            ? 'allowNull' extends keyof TFields[TFieldName]
              ? TFields[TFieldName]['allowNull'] extends true
                ? TFields[TFieldName]['_type'] | null
                : TFields[TFieldName]['_type']
              : never
            : never;
        }
      : {
          [TFieldName in keyof TFields]: '_type' extends keyof TFields[TFieldName]
            ? 'allowNull' extends keyof TFields[TFieldName]
              ? TFields[TFieldName]['allowNull'] extends true
                ? TFields[TFieldName]['_type'] | null
                : TFields[TFieldName]['_type']
              : never
            : never;
        }) &
      (TModelAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
        ? TAbstract extends { fields: any } | { fields: any; abstracts: infer TAbstractsOfAbstract }
          ?
              | ExtractFieldTypes<TAbstract, []>
              | ExtractFieldTypes<
                  TFieldsAndAbstracts,
                  TRestAbstracts extends { fields: any } | { fields: any; abstracts: readonly any[] }
                    ? TRestAbstracts
                    : never[]
                >
          : unknown
        : unknown)
  : unknown;

export type onSetFunction<TModel = any> = (args: {
  data: ExtractFieldTypes<TModel, [], false>;
  search: ExtractFieldTypes<TModel, [], true>;
}) => Promise<any[]>;

export type onRemoveFunction<TModel = any> = (args: {
  /** Sometimes we just want to return the data but we don't want to remove it. Most of the time you should remove it. */
  shouldRemove?: boolean;
  /** Should you return the data that you are removing? By default yes, you should, in case this is false you should not. */
  shouldReturnData?: boolean;
  search: ExtractFieldTypes<TModel, [], true>;
}) => Promise<any[]>;

/**
 * Those are the options that you can pass to the model.
 */
export type ModelOptionsType<TModel = any> = {
  indexes?: ModelIndexType<FieldsOFModelType<TModel>>[];
  ordering?: OrderingOfModelOptions<FieldsOFModelType<TModel>>;
  /**
   * Sometimes a ORM can let you define custom hooks to be fired for example on certain lifecycle events, or for example, sequelize let's you define relations on the model after it was defined.
   * This is a function that will be called after the model is translated so you can apply your custom hooks.
   */
  applyToTranslatedModel?: (translatedModel: any) => void;
  abstract?: boolean;
  underscored?: boolean;
  tableName?: string;
  managed?: boolean;
  databases?: string[];
  customOptions?: any;
  /** The translated instance, with that we bypass the model translation step we just assign it directly to the instance.
   * P.S.: Make sure that the instance is up to date with the model, otherwise you will have problems (and it'll not be our fault).
   */
  instance?: any;
  onGet?: (args: {
    search: ExtractFieldTypes<TModel, [], true>;
    fields: FieldsOFModelType<TModel>;
    ordering?: OrderingOfModelOptions<FieldsOFModelType<TModel>>[];
    limit?: number;
    offset?: number | string;
  }) => Promise<any[]>;
  /**
   * Can be used either for firing a synchronous call to make changes to a particular model or can use the event handler to fire asyncrhronous
   * events to set data to this model. This is useful if you want to make your model in sync with the model from another palmares application or
   * if you want to have hooks attached to this model.
   * */
  onSet?:
    | onSetFunction<TModel>
    | {
        preventCallerToBeTheHandled?: boolean;
        handler: onSetFunction<TModel>;
      };
  /**
   * Can be used either for firing a synchronous call to make changes to a particular model or can use the event handler to fire asyncrhronous
   * events to set data to this model. This is useful if you want to make your model in sync with the model from another palmares application or
   * if you want to have hooks attached to this model.
   * */
  onRemove?:
    | onRemoveFunction<TModel>
    | {
        preventCallerToBeTheHandled?: boolean;
        handler: onRemoveFunction<TModel>;
      };
};

export interface ModelInterface {
  fields: ModelFieldsType;
  options: ModelOptionsType;
  name: string;
  abstracts: (typeof Model)[];
  instances?: Map<keyof DatabaseSettingsType['databases'], any>;
}
0;
export type ModelFields<TModel> = ModelFieldsInQueries<TModel>;

export type IncludesInstances<TModel = any> = {
  model: TModel;
  includes?: IncludesInstances<TModel>[];
};

export * from './queries';
