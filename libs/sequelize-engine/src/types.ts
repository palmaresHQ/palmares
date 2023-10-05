import { InitializedModelsType, ModelFieldsInQueries, models } from '@palmares/databases';
import { IndexesOptions, Model, ModelAttributeColumnOptions, ModelCtor, ModelStatic } from 'sequelize';

export type IndexesToAddOnNextIterationType = {
  tableName: string;
  index: IndexesOptions;
};

export type GetForeignKeyReferencesForTableReturnType = {
  constraintName?: string;
  constraintSchema?: string;
  constraintCatalog?: string;
  tableName?: string;
  tableSchema?: string;
  tableCatalog?: string;
  columnName?: string;
  referencedTableSchema?: string;
  referencedTableCatalog?: string;
  referencedTableName?: string;
  referencedColumnName?: string;
  deferrable?: any;
};

export type MigrationModelType = InitializedModelsType<ModelStatic<Model>>;

export type CircularDependenciesInMigrationType = {
  fromModel: MigrationModelType;
  toModel: MigrationModelType;
  fieldName: string;
  relatedToName: string;
};

export type ModelTranslatorIndexesType = {
  [key: string]: IndexesOptions[];
};

type RelatedFieldsToEvaluateType = {
  field: models.fields.ForeignKeyField;
  fieldAttributes: ModelAttributeColumnOptions;
};

export type RelatedModelToEvaluateAfterType = {
  [key: string]: RelatedFieldsToEvaluateType[];
};

export type SequelizeModel<TModel extends models.BaseModel<any>> = ModelCtor<Model<ModelFieldsInQueries<TModel>>>;

class Base {
  async test(base: Base) {
    return base;
  }
}

class Child extends Base {
  async test(child: Child) {
    return child;
  }
}
