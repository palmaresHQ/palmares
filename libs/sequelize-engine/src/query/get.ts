import { EngineGetQuery, Includes, models, ForeignKeyField } from '@palmares/databases';
import { Includeable, Model, ModelCtor, Order } from 'sequelize';
import SequelizeEngine from '../engine';

export default class SequelizeEngineGetQuery extends EngineGetQuery {
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
   */
  async #parseSearchWithIncludes(
    engine: SequelizeEngine,
    parentModel: models.BaseModel<any>,
    search: any,
    includes: Includes<{ fields: readonly string[] }>,
    defaultParseSearchCallback: (model: models.BaseModel<any>, search: any) => Promise<any>,
    formattedIncludesStatement: Includeable[] = []
  ) {
    console.log(parentModel);
    const parentModelName = parentModel.name;
    const engineName = engine.databaseName;
    for (const include of includes || []) {
      const includedModelName = include.model.name;
      const modelInstance = include.model.default.getModel(engineName) as models.BaseModel<any>;
      const sequelizeModelInstance: ModelCtor<Model> = await include.model.default.getInstance(engineName);

      const directlyRelatedAssociations: [boolean, ForeignKeyField][] = (
        parentModel.associations[includedModelName] || []
      ).map((directlyRelatedAssociation) => [true, directlyRelatedAssociation]);
      const indirectlyRelatedAssociations: [boolean, ForeignKeyField][] = (
        modelInstance.associations[parentModelName] || []
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

  async queryData(
    _engine: SequelizeEngine,
    args: {
      modelOfEngineInstance: ModelCtor<Model>;
      search: any;
      fields: readonly string[];
      ordering?: Order;
      limit?: number;
      offset?: number | string;
    }
  ) {
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
  }
}
