import {
  ModelAttributeColumnOptions,
  Model,
  IndexesOptions,
  ModelStatic,
  DataType,
  ModelCtor,
} from 'sequelize';
import {
  InitializedModelsType,
  ModelFieldsInQueries,
  models,
} from '@palmares/databases';

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

export type SequelizeModel<
  TModel extends InstanceType<ReturnType<typeof models.Model>>
> = ModelCtor<Model<ModelFieldsInQueries<TModel>>>;
