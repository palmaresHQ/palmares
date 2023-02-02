import {
  EngineGetQuery,
  Includes,
  models,
  ForeignKeyField,
} from '@palmares/databases';

import { Includeable, Model, ModelCtor } from 'sequelize';

export default class SequelizeEngineGetQuery extends EngineGetQuery {
  /**
   * This is used to parse all of the includes so we can retrieve the native includes argument to add nested
   * relations to the query.
   *
   * By implementing this we need to make sure that it'll work for all of the queries.
   *
   * @param parentModel - The parent model that this includes relates to.
   * @param search - All of the search from the level of the parent model.
   * @param includes -  The includes statement.
   * @param formattedIncludesStatement - The include statement formatted to something that sequelize can understand.
   */
  async #parseSearchWithIncludes(
    parentModel: InstanceType<ReturnType<typeof models.Model>>,
    search: any,
    includes: Includes<{ fields: readonly string[] }>,
    formattedIncludesStatement: Includeable[] = []
  ) {
    const parentModelName = parentModel.name;
    const engineName = this.engineQueryInstance.engineInstance.databaseName;
    for (const include of includes || []) {
      const includedModelName = include.model.name;
      const modelInstance = include.model.default.getModel(engineName);
      const sequelizeModelInstance: ModelCtor<Model> =
        await include.model.default.getInstance(engineName);

      const directlyRelatedAssociations: [boolean, ForeignKeyField][] = (
        parentModel.associations[includedModelName] || []
      ).map((directlyRelatedAssociation) => [true, directlyRelatedAssociation]);
      const indirectlyRelatedAssociations: [boolean, ForeignKeyField][] = (
        modelInstance.associations[parentModelName] || []
      ).map((indirectlyRelatedAssociation) => [
        false,
        indirectlyRelatedAssociation,
      ]);
      const allAssociations: [boolean, ForeignKeyField][] =
        directlyRelatedAssociations.concat(indirectlyRelatedAssociations);

      for (const [isDirectlyRelated, association] of allAssociations) {
        const relationName = isDirectlyRelated
          ? association.relationName
          : association.relatedName;
        const whereClause =
          search !== undefined ? search[relationName] : undefined;
        const formattedInclude: Includeable = {
          as: relationName,
          model: sequelizeModelInstance,
        };

        if (whereClause) {
          formattedInclude.where = await this.engineQueryInstance.parseSearch(
            modelInstance,
            whereClause
          );
          formattedInclude.required = true;
        }
        if (include.fields)
          formattedInclude.attributes = include.fields as string[];
        if (include.includes) {
          const includesOfIncludes: Includeable[] = [];
          await this.#parseSearchWithIncludes(
            modelInstance,
            whereClause,
            include.includes,
            includesOfIncludes
          );
          formattedInclude.include = includesOfIncludes;
        }
        formattedIncludesStatement.push(formattedInclude);
      }
    }
    return formattedIncludesStatement;
  }

  override async queryDataNatively(
    modelConstructor: ReturnType<typeof models.Model>,
    search: any,
    fields: readonly string[],
    includes: Includes<{ fields: readonly string[] }>
  ) {
    const engineName = this.engineQueryInstance.engineInstance.databaseName;
    const sequelizeModelInstance: ModelCtor<Model> =
      await modelConstructor.default.getInstance(engineName);
    const modelInstance = modelConstructor.default.getModel(engineName);
    const formattedIncludesStatement = await this.#parseSearchWithIncludes(
      modelConstructor.default.getModel(engineName),
      search,
      includes
    );

    const rootLevelWhereClause = await this.engineQueryInstance.parseSearch(
      modelInstance,
      search
    );

    return (
      await sequelizeModelInstance.findAll({
        attributes: fields as string[],
        where:
          Object.keys(rootLevelWhereClause).length > 0
            ? rootLevelWhereClause
            : undefined,
        include: formattedIncludesStatement,
      })
    ).map((data) => data.toJSON());
  }

  override async queryData(args: {
    modelOfEngineInstance: ModelCtor<Model>;
    search: any;
    fields: readonly string[];
  }) {
    return args.modelOfEngineInstance.findAll({
      attributes: args.fields as string[],
      where: args.search,
      nest: true,
      raw: true,
    });
  }
}
