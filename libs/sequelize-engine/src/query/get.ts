import { adapterGetQuery } from '@palmares/databases';

import type { Model, ModelCtor } from 'sequelize';

export default adapterGetQuery({
  // eslint-disable-next-line ts/require-await
  queryData: async (_, args) => {
    const findAllOptions: Parameters<ModelCtor<Model>['findAll']>[0] = {
      attributes: args.fields as string[],
      where: args.search,
      nest: true,
      raw: true,
    };
    if (args.ordering) findAllOptions.order = args.ordering;
    if (args.limit) findAllOptions.limit = args.limit;
    if (args.offset) findAllOptions.offset = Number(args.offset);
    return args.modelOfEngineInstance.findAll(findAllOptions);
  },
});

/**
 * This is used to parse all of the includes so we can retrieve the native includes argument to add nested
 * relations to the query.
 *
 * By implementing this we need to make sure that it'll work for all of the queries.
 *
 * We use this in order to improve the performance of the `get` query.
 *
 * @param parentModel - The parent model that this includes relates to.
 * @param search - All of the search from the level of the parent model.
 * @param includes -  The includes statement.
 * @param formattedIncludesStatement - The include statement formatted to something that sequelize can understand.
async #parseSearchWithIncludes(
  engine: InstanceType<typeof SequelizeEngine>,
  parentModel: ModelBaseClass,
  search: any,
  includes: Includes<{ fields: readonly string[] }>,
  defaultParseSearchCallback: (model: ModelBaseClass, search: any) => Promise<any>,
  formattedIncludesStatement: Includeable[] = []
) {
  const parentModelConstructor = parentModel.constructor as unknown as typeof InternalModelClass_DoNotUse;
  const parentModelName = parentModelConstructor.getName() as string;
  const engineName = engine.connectionName;
  for (const include of includes || []) {
    const includedModelName = include.model.name;
    const modelInstance = include.model.default.getModel(engineName) as ModelBaseClass;
    const modelConstructor = modelInstance.constructor as unknown as typeof InternalModelClass_DoNotUse;

    const sequelizeModelInstance: ModelCtor<Model> = await include.model.default.getInstance(engineName);

    const directlyRelatedAssociations: [boolean, ForeignKeyField][] = (
      parentModelConstructor.associations[includedModelName] || []
    ).map((directlyRelatedAssociation) => [true, directlyRelatedAssociation]);
    const indirectlyRelatedAssociations: [boolean, ForeignKeyField][] = (
      modelConstructor.associations[parentModelName] || []
    ).map((indirectlyRelatedAssociation) => [false, indirectlyRelatedAssociation]);
    const allAssociations: [boolean, ForeignKeyField][] =
      directlyRelatedAssociations.concat(indirectlyRelatedAssociations);

    for (const [isDirectlyRelated, association] of allAssociations) {
      const relationName = isDirectlyRelated ? association.relationName : association.relatedName;
      const whereClause = search !== undefined ? search[relationName] : undefined;
      const formattedInclude: Includeable = {
        as: relationName,
        model: sequelizeModelInstance,
      };

      if (whereClause) {
        formattedInclude.where = await defaultParseSearchCallback(modelInstance, whereClause);
        formattedInclude.required = true;
      }
      if (include.fields) formattedInclude.attributes = include.fields as string[];
      if (include.includes) {
        const includesOfIncludes: Includeable[] = [];
        await this.#parseSearchWithIncludes(
          engine,
          modelInstance,
          whereClause,
          include.includes,
          defaultParseSearchCallback,
          includesOfIncludes
        );
        formattedInclude.include = includesOfIncludes;
      }
      formattedIncludesStatement.push(formattedInclude);
    }
  }
  return formattedIncludesStatement;
}

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
async getIncludeStatement<M extends ModelBaseClass>(
  model: ModelCtor<Model<ModelFields<M>>>,
  includes: ModelCtor<Model<ModelFields<M>>>[],
  includeStatement: Includeable[] = [],
  modelAlreadyParsed: ModelCtor<Model<ModelFields<M>>>[] = []
) {
  modelAlreadyParsed.push(model);
  const associationsOfModel = Object.entries(model.associations);
  for (const [associationName, association] of associationsOfModel) {
    const hasNotParsedModelYet = modelAlreadyParsed.includes(association.target) === false;
    const includesInIncludeStatement = includes.includes(association.target);
    if (hasNotParsedModelYet && includesInIncludeStatement) {
      const nextInclude = [] as Includeable[];
      const includeObject: Includeable = {
        model: association.target,
        as: associationName,
      };
      await this.getIncludeStatement(
        association.target,
        includes.map((include) => (include === association.target ? model : include)),
        nextInclude,
        modelAlreadyParsed
      );
      if (nextInclude.length > 0) includeObject.include = nextInclude;
      includeStatement.push(includeObject);
    }
  }
  return includeStatement;
}

  /*async queryDataNatively(
    engine: SequelizeEngine,
    modelConstructor: ReturnType<typeof models.Model>,
    search: any,
    fields: readonly string[],
    includes: Includes<{ fields: readonly string[] }>,
    defaultParseSearch: (model: models.BaseModel<any>, search: any) => Promise<any>
  ) {
    const engineName = engine.databaseName;
    const sequelizeModelInstance: ModelCtor<Model> = await modelConstructor.default.getInstance(engineName);
    const modelInstance = modelConstructor.default.getModel(engineName);
    const formattedIncludesStatement = await this.#parseSearchWithIncludes(
      engine,
      modelConstructor.default.getModel(engineName),
      search,
      includes,
      defaultParseSearch
    );

    const rootLevelWhereClause = await defaultParseSearch(modelInstance, search);

    return (
      await sequelizeModelInstance.findAll({
        attributes: fields as string[],
        where: Object.keys(rootLevelWhereClause).length > 0 ? rootLevelWhereClause : undefined,
        include: formattedIncludesStatement,
      })
    ).map((data) => data.toJSON());
  }*/
