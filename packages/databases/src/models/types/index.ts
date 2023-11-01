import { Field } from '../fields';
import { Model, BaseModel } from '../model';
import Manager from '../manager';
import { DatabaseSettingsType } from '../../types';
import DatabaseAdapter from '../../engine';
import { FieldsOFModelType, ModelFieldsInQueries } from './queries';

export type ModelType = typeof BaseModel & typeof Model;

export type ManagerInstancesType = {
  [engineName: string]: any;
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

export type ModelIndexType<TFields = string> = {
  unique: boolean;
  fields: TFields[];
};

type OrderingOfModelOptions<TFields> =
  | keyof { [F in TFields as F extends string ? `-${F}` : never]: F }
  | keyof { [F in TFields as F extends string ? `${F}` : never]: F };

export type ExtractFieldNames<TFieldsAndAbstracts, TModelAbstracts> = TFieldsAndAbstracts extends {
  fields: infer TFields;
}
  ?
      | keyof TFields
      | (TModelAbstracts extends readonly [infer TAbstract, ...infer TRestAbstracts]
          ? TAbstract extends { fields: any } | { fields: any; abstracts: infer TAbstractsOfAbstract }
            ?
                | ExtractFieldNames<TAbstract, TAbstractsOfAbstract>
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
  TIsAllOptional extends boolean = false,
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
              | ExtractFieldTypes<TAbstract, TAbstractsOfAbstract>
              | ExtractFieldTypes<
                  TFieldsAndAbstracts,
                  TRestAbstracts extends { fields: any } | { fields: any; abstracts: readonly any[] }
                    ? TRestAbstracts
                    : never[]
                >
          : unknown
        : unknown)
  : unknown;

export type onSetFunction<M = any> = (args: {
  data: ExtractFieldTypes<M, M extends { abstracts: infer TAbstracts } ? TAbstracts : never[], false>;
  search: ExtractFieldTypes<M, M extends { abstracts: infer TAbstracts } ? TAbstracts : never[], true>;
}) => Promise<any[]>;

export type onRemoveFunction<M = any> = (args: {
  /** Sometimes we just want to return the data but we don't want to remove it. Most of the time you should remove it. */
  shouldRemove?: boolean;
  /** Should you return the data that you are removing? By default yes, you should, in case this is false you should not. */
  shouldReturnData?: boolean;
  search: ExtractFieldTypes<M, M extends { abstracts: infer TAbstracts } ? TAbstracts : never[], true>;
}) => Promise<any[]>;

/**
 * Those are the options that you can pass to the model.
 */
export type ModelOptionsType<TModel = any> = {
  indexes?: ModelIndexType<FieldsOFModelType<TModel>>[];
  ordering?: OrderingOfModelOptions<FieldsOFModelType<TModel>>[] | string[];
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
  onGet?: (args: {
    search: ExtractFieldTypes<TModel, TModel extends { abstracts: infer TAbstracts } ? TAbstracts : never[], true>;
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
