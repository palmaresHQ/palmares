/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EngineQuery,
  ModelFields,
  TModel,
  models,
  Includes,
  IncludesInstances,
  ModelFieldsWithIncludes,
} from '@palmares/databases';

import {
  ModelCtor,
  Model,
  CreationAttributes,
  Includeable,
  Transaction,
  ModelAttributeColumnReferencesOptions,
  // eslint-disable-next-line import/no-unresolved
} from 'sequelize/types';
// eslint-disable-next-line import/no-unresolved

export default class SequelizeEngineQuery extends EngineQuery {
  /**
   * This is a recursive function used to retrieve the includes of the queries.
   * What we try to do is to not enable recursive calls. For example:
   *
   * If we have a model user and this model user refers to itself we will not be able to retrieve the relations.
   * for this relation with itself. The same apply for other models.
   *
   * Usually a relation is tied Both ways, this means that, if we have the model User and Post.
   * and we attach each user to a post. Then from the User we will be able to retrieve all of the Posts
   * and from each Post we will be able to retrieve the attached user.
   *
   * Suppose that we are trying to retrieve the posts of the user. That's fine, but trying to retrieve the user from
   * each Post will lead to a circular relation which will lead to a recursion, this is not supported from Sequelize
   * so we do not support this here.
   *
   * About the explanation above: Each user will retrieve N posts, but each post will retrieve a user, but each user
   * will retrieve N posts,... That's what makes it recursive.
   *
   * @param model - The model we want to retrieve the associations from.
   * @param includes - The models that we are wanting to include.
   * @param includeStatement - An array. Remember that it's passed by reference so we can pass it over
   * inside of the recursion and it's reference will be updated.
   * @param modelAlreadyParsed - Those are the models that were already parsed, we need this so we can
   * prevent recursive/circular includes like we explained above.
   *
   * @returns - Returns an array, this array is the include statement to be used inside of the query.
   */
  async getIncludeStatement<M extends TModel>(
    model: ModelCtor<Model<ModelFields<M>>>,
    includes: ModelCtor<Model<ModelFields<M>>>[],
    includeStatement: Includeable[] = [],
    modelAlreadyParsed: ModelCtor<Model<ModelFields<M>>>[] = []
  ) {
    modelAlreadyParsed.push(model);
    const associationsOfModel = Object.entries(model.associations);
    for (const [associationName, association] of associationsOfModel) {
      const hasNotParsedModelYet =
        modelAlreadyParsed.includes(association.target) === false;
      const includesInIncludeStatement = includes.includes(association.target);
      if (hasNotParsedModelYet && includesInIncludeStatement) {
        const nextInclude = [] as Includeable[];
        const includeObject: Includeable = {
          model: association.target,
          as: associationName,
        };
        await this.getIncludeStatement(
          association.target,
          includes.map((include) =>
            include === association.target ? model : include
          ),
          nextInclude,
          modelAlreadyParsed
        );
        if (nextInclude.length > 0) includeObject.include = nextInclude;
        includeStatement.push(includeObject);
      }
    }
    return includeStatement;
  }

  async create(
    instance: ModelCtor<Model<any>>,
    data: CreationAttributes<Model<ModelFields<any>>>,
    transaction: Transaction
  ): Promise<[boolean, Model<any, any>[]]> {
    return [true, [await instance.create(data, { transaction })]];
  }

  async update(
    instance: ModelCtor<Model<any>>,
    search: any,
    data: any,
    transaction: Transaction
  ): Promise<[boolean, Model<any, any>[]]> {
    const instancesToUpdate = await instance.findAll({
      where: search,
      transaction,
    });
    if (instancesToUpdate.length === 0)
      return await this.create(instance, data, transaction);
    const updatedInstances = await Promise.all(
      instancesToUpdate.map(async (instanceToUpdate) => {
        instanceToUpdate.set(data);
        await instanceToUpdate.save({ transaction });
        return instanceToUpdate;
      })
    );
    return [false, updatedInstances];
  }

  async save(
    instance: ModelCtor<Model<any>>,
    data: any,
    transaction: Transaction,
    includes?: ModelCtor<Model<any>>[],
    search?: any
  ): Promise<void> /*Promise<[boolean, Model<any, any>[]]>*/ {
    async function saveQueries(this: SequelizeEngineQuery) {
      if (search) return this.update(instance, search, data, transaction);
      return this.create(instance, data, transaction);
    }
    // Saves the model.
    if (includes === undefined) {
      await saveQueries.bind(this)();
      return;
    }

    const [wasCreated, allOfSavedData] = await saveQueries.bind(this)();

    // Loops through the associations and saves them as well
    const associationsEntriesOfInstance = Object.entries(instance.associations);
    const promises = associationsEntriesOfInstance.map(
      async ([fieldName, associationObject]) => {
        const existsFieldNameInTheDataRetrieved = fieldName in data;
        const shouldWeIncludeTheAssociation = includes?.includes(
          associationObject.target
        );
        const attributeOfReference =
          associationObject.target.getAttributes()[
            associationObject.foreignKey
          ];
        if (
          existsFieldNameInTheDataRetrieved &&
          shouldWeIncludeTheAssociation &&
          attributeOfReference
        ) {
          const fieldNameOfReference = (
            attributeOfReference.references as ModelAttributeColumnReferencesOptions
          ).key as string;
          const dataOfRelationToSave: any = Array.isArray(data[fieldName])
            ? data[fieldName]
            : [data[fieldName]];
          await Promise.all(
            allOfSavedData.map(async (savedData) => {
              const savedDataJson = savedData.toJSON();

              await Promise.all(
                dataOfRelationToSave.map(async (dataToSave: any) => {
                  dataToSave[associationObject.foreignKey] =
                    savedDataJson[fieldNameOfReference];
                  await this.save(
                    associationObject.target,
                    dataToSave,
                    transaction,
                    includes,
                    wasCreated
                      ? undefined
                      : {
                          [associationObject.foreignKey]:
                            savedDataJson[fieldNameOfReference],
                        }
                  );
                })
              );
            })
          );
        }
      }
    );
    await Promise.all(promises);
  }

  /*
  override async set<
    TModel extends InstanceType<ReturnType<typeof models.Model>>,
    TIncludes extends Includes = undefined,
    TSearch extends
      | ModelFieldsWithIncludes<TModel, TIncludes, false, false, true, true>
      | undefined
      | null = undefined
  >(
    instance: ModelCtor<Model>,
    data: ModelFieldsWithIncludes<
      TModel,
      TIncludes,
      true,
      false,
      TSearch extends undefined ? false : true,
      false
    >,
    search?: TSearch,
    includes?: IncludesInstances<ModelCtor<Model>>[],
    internal?: {
      model: TModel;
      includes: TIncludes;
    }
  ): Promise<
    TSearch extends undefined
      ? ModelFieldsWithIncludes<TModel, TIncludes>
      : ModelFieldsWithIncludes<TModel, TIncludes>[]
  > {
    return [] as unknown as Promise<
      TSearch extends undefined
        ? ModelFieldsWithIncludes<TModel, TIncludes>
        : ModelFieldsWithIncludes<TModel, TIncludes>[]
    >;
    /*type SequelizeModel = Model<ModelFields<M>>;
type SequelizeAttributes = Attributes<SequelizeModel>;
type UpdateValueType = {
  [key in keyof SequelizeAttributes]?:
    | SequelizeAttributes[key]
    | Fn
    | Col
    | Literal;
};
type SearchType = WhereOptions<SequelizeAttributes>;

try {
  await this.engineInstance.transaction(
    async (transaction: Transaction) => {
      await this.save(instance, data, transaction, includes, search);
    }
  );

  return true as unknown as S extends undefined | null
    ? IncludesRelatedModels<AllRequiredModelFields<M>, M, I> | undefined
    : boolean;
  /*
  if (search) {
    await instance.update<Model<ModelFields<M>>>(data as UpdateValueType, {
      where: search as SearchType,
    });
    return true as S extends undefined | null
      ? IncludesRelatedModels<AllRequiredModelFields<M>, M, I> | undefined
      : boolean;
  }
  return (await instance.create(
    data as CreationAttributes<SequelizeModel>
  )) as unknown as S extends undefined | null
    ? IncludesRelatedModels<AllRequiredModelFields<M>, M, I> | undefined
    : boolean;
} catch (e) {
  if (search) {
    return false as S extends undefined | null
      ? IncludesRelatedModels<AllRequiredModelFields<M>, M, I> | undefined
      : boolean;
  }
  return undefined as S extends undefined | null
    ? IncludesRelatedModels<AllRequiredModelFields<M>, M, I> | undefined
    : boolean;
}
  }
  */
}
