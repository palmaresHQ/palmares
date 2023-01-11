/* eslint-disable @typescript-eslint/no-unused-vars */
import model from '../models/model';
import type EngineQuery from './query';
import type {
  Includes,
  ModelFieldsWithIncludes,
  FieldsOFModelType,
} from '../models/types';
import { ForeignKeyField } from '../models/fields';
import { NotImplementedEngineException } from './exceptions';

/** This class is used to run `.get` queries, so when we want to retrieve a value from the database to the user. */
export default class EngineGetQuery {
  engineQueryInstance: EngineQuery;

  constructor(engineQuery: EngineQuery) {
    this.engineQueryInstance = engineQuery;
  }

  /**
   * This is a simple query, by default you should always implement this function in your EngineGetQuery.
   *
   * This will guarantee that you are able to retrieve the data, it's not much performatic because it will do
   * many small queries to the database, which might slow things down, but you will be guaranteed to work 100%
   * with the types.
   *
   * For a more performatic approach you should implement `queryDataNatively`. That will translate the query to the
   * native query, but the second can be harder to implement since it relies on knowing about palmares objects and
   * model structure.
   *
   * @param modelConstructor - The model instance to query.
   * @param search - The search argument to search on the database.
   * @param fields - The fields to be included in the search and the output.
   */
  async queryData(
    modelConstructor: any,
    search: any,
    fields?: readonly string[]
  ): Promise<any[]> {
    return [];
  }

  async queryDataNatively(
    modelConstructor: ReturnType<typeof model>,
    search: any,
    fields: readonly string[],
    includes: Includes
  ): Promise<any[]> {
    throw new NotImplementedEngineException('queryDataNatively');
  }

  async #resultsFromRelatedModelWithSearch(
    relatedName: string,
    relatedField: ForeignKeyField<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >,
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfModel: string[],
    fieldsOfIncludedModel: string[],
    searchForRelatedModel: any,
    search: any,
    results: any[],
    isDirectlyRelated = false
  ) {
    const parentFieldName = isDirectlyRelated
      ? relatedField.fieldName
      : relatedField.toField;
    const fieldNameOfRelationInIncludedModel = isDirectlyRelated
      ? relatedField.toField
      : relatedField.fieldName;
    const resultOfIncludes: any[] = [];
    const [hasIncludedField, fieldsOfIncludedModelWithFieldsFromRelation] =
      fieldsOfIncludedModel.includes(fieldNameOfRelationInIncludedModel)
        ? [false, fieldsOfIncludedModel]
        : [
            true,
            fieldsOfIncludedModel.concat([fieldNameOfRelationInIncludedModel]),
          ];

    await this.#getResultsWithIncludes(
      includedModelInstance,
      fieldsOfIncludedModelWithFieldsFromRelation,
      includesOfIncluded,
      await this.engineQueryInstance.parseSearch(
        includedModelInstance,
        searchForRelatedModel
      ),
      resultOfIncludes
    );
    const resultByUniqueFieldValue: Record<string, any[]> = {};

    for (const result of resultOfIncludes) {
      const uniqueFieldValueOnRelation =
        result[fieldNameOfRelationInIncludedModel];

      if (hasIncludedField) delete result[fieldNameOfRelationInIncludedModel];

      const existsValueForUniqueFieldValueOnResults =
        resultByUniqueFieldValue[uniqueFieldValueOnRelation] !== undefined;

      if (existsValueForUniqueFieldValueOnResults) {
        resultByUniqueFieldValue[uniqueFieldValueOnRelation].push(result);
      } else {
        const nextSearch = {
          [parentFieldName]: uniqueFieldValueOnRelation,
          ...search,
        };
        await this.#getResultsWithIncludes(
          modelInstance,
          fieldsOfModel,
          includesOfModel,
          await this.engineQueryInstance.parseSearch(modelInstance, nextSearch),
          results
        );

        resultByUniqueFieldValue[uniqueFieldValueOnRelation] = [result];
        results[results.length - 1][relatedName] =
          relatedField.unique || isDirectlyRelated
            ? resultByUniqueFieldValue[uniqueFieldValueOnRelation][0]
            : resultByUniqueFieldValue[uniqueFieldValueOnRelation];
      }
    }
  }

  async #resultsFromRelatedModelsWithoutSearch(
    relatedName: string,
    relatedField: ForeignKeyField<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >,
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfModel: string[],
    fieldsOfIncludedModel: string[],
    search: any,
    results: any[],
    isDirectlyRelated = false
  ) {
    const parentFieldName = isDirectlyRelated
      ? relatedField.fieldName
      : relatedField.toField;
    const fieldNameOfRelationInIncludedModel = isDirectlyRelated
      ? relatedField.toField
      : relatedField.fieldName;
    // Get the results of the parent model and then get the results of the children (included) models
    const [hasIncludedField, fieldsOfModelWithFieldsFromRelations] =
      fieldsOfModel.includes(parentFieldName)
        ? [false, fieldsOfModel]
        : [true, fieldsOfModel.concat([parentFieldName])];

    await this.#getResultsWithIncludes(
      modelInstance,
      fieldsOfModelWithFieldsFromRelations,
      includesOfModel,
      search,
      results
    );
    for (const result of results) {
      const uniqueFieldValueOnRelation = result[parentFieldName];
      const nextSearch = {
        [fieldNameOfRelationInIncludedModel]: uniqueFieldValueOnRelation,
      };
      const resultOfIncludes: any[] = [];
      await this.#getResultsWithIncludes(
        includedModelInstance,
        fieldsOfIncludedModel,
        includesOfIncluded,
        nextSearch,
        resultOfIncludes
      );

      if (hasIncludedField) delete result[parentFieldName];
      result[relatedName] =
        relatedField.unique || isDirectlyRelated
          ? resultOfIncludes[0]
          : resultOfIncludes;
    }
  }

  /**
   * Indirectly related models are relations that does not exist on the parent model by itself. What?
   *
   * For example, if we have two models: `User` and `Post`, if Post has the field `userId` and is directly connected to User.
   * There is no way for the `User` model to know that `Post` is related to it, so we need to access the Post model and get the reference.
   *
   * The problem here relies when there is a search statement for the included model.
   *
   * By default we first retrieve the results from the parent model, after that we retrieve the values from the children. But with search we
   * should first retrieve the children data, and just after that we should retrieve the parent data. Because of that everything should work recursively.
   *
   * Another problem relies on the fields, we do need the fields of the relation on the model, for example, if the user just wants to retrieve the `firstName` field
   * from the `User` model, we still might need the `id` field so we can use this value in the relation, because of that we will always add the field of the relation
   * on the actual query.
   *
   * @param modelInstance - The model instance of the parent (not the children)
   * @param includedModelInstance - The model instance of the included children.
   * @param includesOfModel - All of the other included models.
   * @param includesOfIncluded - All of the included models of the included model, this refers to the
   * includes inside of the included model.
   * @param fieldsOfIncludedModel - The fields accepted in the included model. On the included model, what fields
   * should be displayed
   * @param fieldsOfModel -The fields of the `modelInstance` (parent model).
   * @param search - The search arguments.
   * @param results - All of the fetched results.
   */
  async #resultsFromIndirectlyRelatedModels(
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfIncludedModel: string[],
    fieldsOfModel: string[],
    search: any,
    results: any[]
  ) {
    // If there is a query for this model, then we need to query it before retrieving the data of the current model.
    // otherwise just retrieve the data of the current model.
    const relatedNamesIndirectlyRelatedToModel =
      modelInstance.indirectlyRelatedTo[includedModelInstance.originalName] ||
      [];
    const associationsOfIncludedModel =
      includedModelInstance.associations[modelInstance.originalName] || [];

    for (const relatedName of relatedNamesIndirectlyRelatedToModel) {
      const searchForRelatedModel = search[relatedName];
      const relatedField = associationsOfIncludedModel.find(
        (association) => association._originalRelatedName === relatedName
      );
      if (relatedField && searchForRelatedModel) {
        await this.#resultsFromRelatedModelWithSearch(
          relatedName,
          relatedField,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel,
          fieldsOfIncludedModel,
          searchForRelatedModel,
          search,
          results,
          false
        );
      } else if (relatedField) {
        await this.#resultsFromRelatedModelsWithoutSearch(
          relatedName,
          relatedField,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel,
          fieldsOfIncludedModel,
          search,
          results,
          false
        );
      }
    }
  }

  /**
   * Directly related models are relations that exist on the parent model by itself. What?
   *
   * For example, if we have two models: `User` and `Post`, if Post has the field `userId` and is directly connected to User.
   * a direct relation is the `user` existing in the `Post` model.
   *
   * This is basically the same as `#resultsFromIndirectlyRelatedModels` but just flipping the `toField` on the association to the
   * `relationName` to get the name of the associated field.
   *
   * @param modelInstance - The model instance of the parent (not the children)
   * @param includedModelInstance - The model instance of the included children.
   * @param includesOfModel - All of the other included models.
   * @param includesOfIncluded - All of the included models of the included model, this refers to the
   * includes inside of the included model.
   * @param fieldsOfIncludedModel - The fields accepted in the included model. On the included model, what fields
   * should be displayed
   * @param fieldsOfModel -The fields of the `modelInstance` (parent model).
   * @param search - The search arguments.
   * @param results - All of the fetched results.
   */
  async #resultsFromDirectlyRelatedModels(
    modelInstance: InstanceType<ReturnType<typeof model>>,
    includedModelInstance: InstanceType<ReturnType<typeof model>>,
    includesOfModel: Includes,
    includesOfIncluded: Includes,
    fieldsOfIncludedModel: string[],
    fieldsOfModel: string[],
    search: any,
    results: any[]
  ) {
    const relationNamesDirectlyRelatedToModel =
      modelInstance.directlyRelatedTo[includedModelInstance.originalName] || [];
    const associationsOfModel =
      modelInstance.associations[includedModelInstance.originalName] || [];

    for (const relationName of relationNamesDirectlyRelatedToModel) {
      const foreignKeyFieldRelatedToModel = associationsOfModel.find(
        (association) => association.relationName === relationName
      );
      const searchForRelatedModel = search[relationName];

      if (foreignKeyFieldRelatedToModel && searchForRelatedModel) {
        await this.#resultsFromRelatedModelWithSearch(
          relationName,
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel,
          fieldsOfIncludedModel,
          searchForRelatedModel,
          search,
          results,
          true
        );
      } else if (foreignKeyFieldRelatedToModel) {
        await this.#resultsFromRelatedModelsWithoutSearch(
          relationName,
          foreignKeyFieldRelatedToModel,
          modelInstance,
          includedModelInstance,
          includesOfModel,
          includesOfIncluded,
          fieldsOfModel,
          fieldsOfIncludedModel,
          search,
          results,
          true
        );
      }
    }
  }

  async #getResultsWithIncludes(
    modelInstance: InstanceType<ReturnType<typeof model>>,
    fields: string[],
    includes: Includes,
    search: object,
    result: any[] = []
  ) {
    const safeIncludes = typeof includes !== 'undefined' ? includes : [];
    const hasIncludes = safeIncludes.length > 0;

    if (hasIncludes) {
      const include = safeIncludes[0];
      const includedModel = include.model.default.getModel(
        this.engineQueryInstance.engineInstance.databaseName
      );
      const allFieldsOfIncludedModel = Object.keys(includedModel['fields']);
      const isNotACircularReference =
        modelInstance.originalName !== includedModel.originalName;

      if (isNotACircularReference) {
        const isDirectlyRelatedModel =
          modelInstance.directlyRelatedTo[includedModel.originalName] !==
          undefined;
        const isIndirectlyRelatedModel =
          modelInstance.indirectlyRelatedTo[includedModel.originalName] !==
          undefined;

        if (isIndirectlyRelatedModel) {
          await this.#resultsFromIndirectlyRelatedModels(
            modelInstance,
            includedModel,
            safeIncludes.slice(1),
            include.includes,
            (include.fields as string[]) ||
              (allFieldsOfIncludedModel as string[]),
            fields,
            search,
            result
          );
        } else if (isDirectlyRelatedModel) {
          await this.#resultsFromDirectlyRelatedModels(
            modelInstance,
            includedModel,
            safeIncludes.slice(1),
            include.includes,
            (include.fields as string[]) ||
              (allFieldsOfIncludedModel as string[]),
            fields,
            search,
            result
          );
        }
      }
    } else {
      const modelConstructor = modelInstance.constructor as ReturnType<
        typeof model
      >;
      const translatedModelInstance =
        await modelConstructor.default.getInstance(
          this.engineQueryInstance.engineInstance.databaseName
        );
      result.push(
        ...(await this.queryData(translatedModelInstance, search, fields))
      );
    }
  }

  async run<
    TModel extends InstanceType<ReturnType<typeof model>>,
    TIncludes extends Includes = undefined,
    TFieldsOfModel extends FieldsOFModelType<
      InstanceType<ReturnType<typeof model>>
    > = readonly (keyof TModel['fields'])[],
    TSearch extends
      | ModelFieldsWithIncludes<
          TModel,
          TIncludes,
          TFieldsOfModel,
          false,
          false,
          true,
          true
        >
      | undefined = undefined
  >(
    args: {
      fields?: TFieldsOfModel;
      search?: TSearch;
    },
    internal: {
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<ModelFieldsWithIncludes<TModel, TIncludes>[]> {
    const result: any[] = [];
    const selectedFields = (args.fields ||
      Object.keys(internal.model.fields)) as string[];
    try {
      return await this.queryDataNatively(
        internal.model.constructor as ReturnType<typeof model>,
        args.search,
        selectedFields,
        internal.includes
      );
    } catch (e) {
      if ((e as Error).name === NotImplementedEngineException.name)
        await this.#getResultsWithIncludes(
          internal.model,
          selectedFields,
          internal.includes,
          args.search as object,
          result
        );
      else throw e;
    }
    return result as ModelFieldsWithIncludes<TModel, TIncludes>[];
  }
}
