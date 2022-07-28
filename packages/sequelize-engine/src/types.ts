import { ModelAttributeColumnOptions, Model, IndexesOptions, ModelStatic, DataType } from "sequelize";
import { InitializedModelsType, models } from "@palmares/databases";

export type IndexesToAddOnNextIterationType = {
  tableName: string,
  index: IndexesOptions
}

export type GetForeignKeyReferencesForTableReturnType = {
  constraintName?: string,
  constraintSchema?: string,
  constraintCatalog?: string,
  tableName?: string,
  tableSchema?: string,
  tableCatalog?: string,
  columnName?: string,
  referencedTableSchema?: string,
  referencedTableCatalog?: string,
  referencedTableName?: string,
  referencedColumnName?: string,
  deferrable?: any;
}

export type MigrationModelType = InitializedModelsType<ModelStatic<Model>>;

export type CircularDependenciesInMigrationType = {
  fromModel: MigrationModelType;
  toModel: MigrationModelType;
  fieldName: string;
  relatedToName: string;
};

export type ModelTranslatorIndexesType = {
    [key: string]: IndexesOptions[]
}

type RelatedFieldsToEvaluateType = {
    field: models.fields.ForeignKeyField,
    fieldAttributes: ModelAttributeColumnOptions
}

export type RelatedModelToEvaluateAfterType = {
    [key: string]: RelatedFieldsToEvaluateType[]
}
