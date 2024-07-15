import { adapterModels, ModelOptionsType } from '@palmares/databases';
import fs from 'fs';
import path from 'path';


export default adapterModels({
  translateOptions: async (_engine, _modelName, options): Promise<{}> => {
    return {
      ...options
    };
  },

  translate: async (
    engine,
    modelName,
    _model,
    _fieldEntriesOfModel,
    modelOptions,
    defaultTranslateCallback: () => Promise<{ options: {}, fields: {}}>,
    _,
    __
  ): Promise<{
    fields: Record<string, string>;
    options: ModelOptionsType;
  }> => {
    const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();
    return {
      fields: translatedAttributes,
      options: translatedOptions
    };
  },

  afterModelsTranslation: async (engine, models): Promise<[string, any][]> => {
    let fileContent = '';
    const imports = new Set([
      `import * as d from 'drizzle-orm/${engine.instance.mainType === 'postgres' ? 'pg' : engine.instance.mainType === 'sqlite' ? 'sqlite' : 'mysql'}-core';`
    ]);

    const folderName = path.join(process.cwd(), engine.instance.output)
    fs.mkdirSync(folderName, { recursive: true });

    const relationships = new Map<string, Record<string, string>>();
    const tableType = engine.instance.mainType === 'postgres' ? 'pgTable' : engine.instance.mainType === 'sqlite' ? 'sqliteTable' : 'mysqlTable'
    for (let i=0; i<models.length; i++) {
      const [modelName, model] = models[i];

      for (const [relationModelName, relations] of Object.entries(model.options.relationships || {})) {
        relationships.set(relationModelName, {...(relationships.get(relationModelName) || {}), ...relations as any});
      }

      const indexesOfModel = model.options.indexes || [];
      const entriesOfFields = Object.entries(model.fields);
      const hasEnums = (model.options.enums || []).length > 0;

      if (model.options.imports)
        Array.from(model.options.imports || []).forEach((importString) => imports.add(importString as string));

      const modelContentStarter = hasEnums ? model.options.enums.map((enumColumn: string) => enumColumn).join('\n') + '\n\n' : '';
      const modelContent = `${modelContentStarter}export const ${modelName} = d.${tableType}('${model.options.tableName}', {\n${
      entriesOfFields.map(([fieldName, fieldString]) => `  ${fieldName}: ${fieldString}`).join(',\n')
      }\n}${indexesOfModel.length > 0 ? `, (table) => ({\n` +
      `${
      indexesOfModel.map((index: {
        fieldName: string;
        databaseName: string;
        unique: boolean;
      }) => `  ${index.fieldName}Idx: d.${index.unique ? 'uniqueIndex': 'index'}('${model.options.tableName}_${index.databaseName}_idx').on(table.${index.fieldName})`).join(',\n')
      }\n})` : ''});\n\n`;
      fileContent += modelContent;
      models[i] = [modelName, Function('require', `return require('${path.join(process.cwd(), engine.instance.output, 'schema.ts')}').${modelName}`)];
    }

    if (relationships.size > 0) imports.add(`import * as drzl from 'drizzle-orm';`);

    for (const [modelName, relations] of relationships.entries()) {
      fileContent += `export const ${modelName}Relations = drzl.relations(${modelName}, (args) => ({\n${Object.entries(relations).map(([relationName, relation]) => `  ${relationName}: ${relation}`).join(',\n')}\n}));\n\n`;
    }

    fs.writeFileSync(path.join(folderName, 'schema.ts'), `${Array.from(imports).join('\n')}\n\n${fileContent}`);

    const modelsImported = await Promise.all(models.map(async ([modelName, model]) => [modelName, model(require)])) as [string, any][];
    return modelsImported;
  }
});
