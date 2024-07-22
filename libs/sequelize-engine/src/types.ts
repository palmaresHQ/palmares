import type { InitializedModelsType, ModelFields, Model as PalmaresModel, fields } from '@palmares/databases';
import type { IndexesOptions, Model, ModelAttributeColumnOptions, ModelCtor, ModelStatic } from 'sequelize';

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
  field: fields.ForeignKeyField;
  fieldAttributes: ModelAttributeColumnOptions;
};

export type RelatedModelToEvaluateAfterType = {
  [key: string]: RelatedFieldsToEvaluateType[];
};

export type SequelizeModel<TTypeModel extends InstanceType<ReturnType<typeof PalmaresModel>>> = ModelCtor<
  Model<ModelFields<TTypeModel>>
>;

export type TranslatedFieldToEvaluateAfterType = {
  fieldAttributes: ModelAttributeColumnOptions<Model<any, any>>;
  type: 'foreign-key' | 'date' | 'indexes';
};
