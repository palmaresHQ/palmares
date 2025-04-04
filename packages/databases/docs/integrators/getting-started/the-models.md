[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[integrators](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/integrators/summary.md) >
[the-models](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/integrators/getting-started/the-models.md)

# Getting Started > The Models

Don't get tired now, we are on the most exciting part: How to translate the models. Bring your computer, mouse, keyboard and open your favorite code editor.

The first thing you gotta understand is that: Yes, you can totally create everything on a single file. But we took the time to try to organize it for you. For the models we want you to create a `models.ts` file.

From now let's look at Drizzle's and Sequelize's example and explore how to handle it on your own:

#### Drizzle

```ts
import { getDefaultStd } from '@palmares/core';
import { adapterModels } from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases';

export const models = adapterModels({
  // eslint-disable-next-line ts/require-await
  translateOptions: async (_engine, modelName, options): Promise<object> => {
    const optionsWithConjunctiveIndexes = options as typeof options & { conjunctiveIndexes: string[] };
    if (options.indexes)
      optionsWithConjunctiveIndexes.conjunctiveIndexes = options.indexes.map((index) => {
        const indexFields = index.fields.join('_');
        const indexAsCamel = indexFields.toLowerCase().replace(/(^([a-z]+))|([-_][a-z])/g, (group) => {
          const groupWithoutDash = group.replace(/[-_]/, '');
          const firstLetterUpper = groupWithoutDash[0].toUpperCase();
          return firstLetterUpper + groupWithoutDash.slice(1);
        });
        const indexFieldsForOnClause = index.fields.map((field) => `table.${field}`).join(', ');
        return `  ${modelName.slice(0, 1).toLowerCase() + modelName.slice(1)}${indexAsCamel}:  d.${
          index.unique ? 'uniqueIndex' : 'index'
        }('${options.tableName || modelName}_${indexFields}').on(${indexFieldsForOnClause})`;
      });

    return {
      ...options,
    };
  },

  translate: async (
    _engine,
    _modelName,
    _model,
    _fieldEntriesOfModel,
    _modelOptions,
    _customModelOptions,
    defaultTranslateCallback: () => Promise<{ options: any; fields: any }>,
    _,
    __
  ): Promise<{
    fields: Record<string, string>;
    options: ModelOptionsType;
  }> => {
    const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();
    return {
      fields: translatedAttributes,
      options: translatedOptions,
    };
  },

  afterModelsTranslation: async (engine, models): Promise<[string, any][]> => {
    let fileContent = '';
    const std = getDefaultStd();
    const [cwd, directoryName] = await Promise.all([std.os.cwd(), std.files.dirname(engine.instance.output)]);
    const [folderName, locationToRequire] = await Promise.all([
      std.files.join(cwd, directoryName),
      std.files.join(cwd, engine.instance.output),
    ]);
    const imports = new Set([
      `/** Automatically generated by @palmares/drizzle-engine on ${new Date().toISOString()} */ \n`,
      `import * as d from 'drizzle-orm/${
        engine.instance.mainType === 'postgres' ? 'pg' : engine.instance.mainType === 'sqlite' ? 'sqlite' : 'mysql'
      }-core';`,
    ]);

    const relationships = new Map<string, Record<string, string>>();
    const tableType =
      engine.instance.mainType === 'postgres'
        ? 'pgTable'
        : engine.instance.mainType === 'sqlite'
          ? 'sqliteTable'
          : 'mysqlTable';
    for (let i = 0; i < models.length; i++) {
      const [modelName, model] = models[i];

      for (const [relationModelName, relations] of Object.entries(model.options.relationships || {})) {
        relationships.set(relationModelName, {
          ...(relationships.get(relationModelName) || {}),
          ...(relations as any),
        });
      }

      const indexesOfModel = model.options.drizzleIndexes || [];
      const entriesOfFields = Object.entries(model.fields);
      const hasEnums = (model.options.enums || []).length > 0;

      if (model.options.imports)
        Array.from(model.options.imports || []).forEach((importString) => imports.add(importString as string));

      const modelContentStarter = hasEnums
        ? model.options.enums.map((enumColumn: string) => enumColumn).join('\n') + '\n\n'
        : '';
      const modelContent = `${modelContentStarter}export const ${modelName} = d.${
        tableType
      }('${model.options.tableName}', {\n${entriesOfFields
        .map(([fieldName, fieldString]) => `  ${fieldName}: ${fieldString}`)
        .join(',\n')}\n}${
        indexesOfModel.length > 0
          ? `, (table) => ({\n` +
            `${indexesOfModel
              .map(
                (index: { fieldName: string; databaseName: string; unique: boolean }) =>
                  `  ${index.fieldName}Idx: d.${index.unique ? 'uniqueIndex' : 'index'}('${
                    model.options.tableName
                  }_${index.databaseName}_idx').on(table.${index.fieldName})`
              )
              .concat(model.options.conjunctiveIndexes || [])
              .join(',\n')}\n})`
          : ''
      });\n\n`;
      fileContent += modelContent;
      models[i] = [
        modelName,
        async () => {
          try {
            return Promise.resolve(require(locationToRequire)[modelName]);
          } catch (e) {
            return (await import(locationToRequire))[modelName];
          }
        },
      ];
    }
    if (relationships.size > 0) imports.add(`import * as drzl from 'drizzle-orm';`);

    for (const [modelName, relations] of relationships.entries()) {
      fileContent += `export const ${modelName}Relations = drzl.relations(${modelName}, (args) => ({\n${Object.entries(
        relations
      )
        .map(([relationName, relation]) => `  ${relationName}: ${relation}`)
        .join(',\n')}\n}));\n\n`;
    }

    await std.files.makeDirectory(folderName);
    await std.files.writeFile(locationToRequire, `${Array.from(imports).join('\n')}\n\n${fileContent}`);

    const modelsImported = await Promise.all(models.map(async ([modelName, model]) => [modelName, await model()]));
    return modelsImported as [string, any][];
  },
});
```

#### Sequelize

```ts
import { adapterModels } from '@palmares/databases';
import { Model } from 'sequelize';

import { getIndexes } from './utils';

import type { ModelOptionsType } from '@palmares/databases';
import type { ModelAttributes, ModelCtor, ModelOptions, OrderItem } from 'sequelize';

/**
 * Translates the default ordering of the model, so everytime a query is made we guarantee that the ordering is applied.
 */
// eslint-disable-next-line ts/require-await
async function translateOrdering(modelOptions: ModelOptionsType, translatedModel: ModelCtor<Model>) {
  const translatedOrdering: OrderItem[] = (modelOptions.ordering || []).map((order) => {
    const orderAsString = order;
    const isDescending = orderAsString.startsWith('-');
    return isDescending ? [orderAsString.substring(1), 'DESC'] : [orderAsString, 'ASC'];
  });

  if (translatedOrdering.length > 0) {
    translatedModel.addScope(
      'defaultScope',
      {
        // eslint-disable-next-line ts/no-unnecessary-condition
        order: translatedOrdering || [],
      },
      { override: true }
    );
  }
}

export default adapterModels({
  // eslint-disable-next-line ts/require-await
  translateOptions: async (_engine, _modelName, options): Promise<ModelOptions> => {
    return {
      underscored: options.underscored || true,
      timestamps: false,
      tableName: options.tableName,
      ...options.customOptions,
    };
  },
  translate: async (
    engine,
    modelName,
    _model,
    _fieldEntriesOfModel,
    modelOptions,
    _customModelOptions,
    defaultTranslateCallback: () => Promise<{ options: ModelOptions; fields: ModelAttributes<any> }>,
    _,
    __
  ): Promise<ModelCtor<Model> | undefined> => {
    const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();

    if (Array.isArray(translatedOptions.indexes))
      translatedOptions.indexes.push(...getIndexes(engine.connectionName, modelName));
    else translatedOptions.indexes = getIndexes(engine.connectionName, modelName);

    const sequelizeModel = new Function('sequelizeModel', `return class ${modelName} extends sequelizeModel {}`)(Model);
    const translatedModel = sequelizeModel.init(translatedAttributes, {
      sequelize: engine.instance,
      ...translatedOptions,
    });

    if (translatedModel !== undefined) await translateOrdering(modelOptions, translatedModel);
    return translatedModel;
  },
});
```

## Let's break it down

> Strange but I can accept it.

Yeah, not as difficult as you thought right? No?

So there are major differences between Sequelize models and Drizzle models. The first one will build the models in memory. They will exist as long as the application exist. Engines like that are intended to work best for Serverful environments. The model will exist as long as the application is running. The application stopped? The model is taken down with it. I mean, essentially all of the models you create will exist in memory, i know, but you get the idea. When the server is up again we will translate all the models again.

Now back to Drizzle. On Drizzle we work differently, specially because we wanted to see how it differs from options like Sequelize since we intend to support engines like Prisma. On Drizzle we are creating a file with the Drizzle models. On Drizzle you need to pass a `schema` with all the schemas when you open a new database connection. Because of that what we are doing when translating is creating the `schemas.ts` file. Every model will actually be a string, or at least, the data needed to build that string.

Because of how they behave we how we get the model is different from each one.

On Sequelize we have the following on the `translate` method.

```ts
const sequelizeModel = new Function('sequelizeModel', `return class ${modelName} extends sequelizeModel {}`)(Model);
const translatedModel = sequelizeModel.init(translatedAttributes, {
  sequelize: engine.instance,
  ...translatedOptions,
});

if (translatedModel !== undefined) await translateOrdering(modelOptions, translatedModel);
return translatedModel;
```

What this is doing is creating a `sequelizeModel` the traditional way you would following the documentation. We just use the `Function` constructor because there is no other way to create classes dynamically. I mean, there is, but we need to properly name each model on Sequelize. Like we told you, this model will be translated to a Sequelize model in runtime.

Now back to Drizzle we have the following on `afterModelsTranslation` method.

```ts
// This
models[i] = [
  modelName,
  async () => {
    try {
      return Promise.resolve(require(locationToRequire)[modelName]);
    } catch (e) {
      return (await import(locationToRequire))[modelName];
    }
  },
];

// And this afterwards.
const modelsImported = await Promise.all(models.map(async ([modelName, model]) => [modelName, await model()]));
```

So let's review it. Remember when we told you Drizzle is just creating a file? Okay, we have created a file with all the models, now we need to use it. **Dynamic Import/Require** for the rescue! On that case we are dynamically requiring the created `schema.ts` file. If that fails, we have `import` to back us up. **Remember, we don't have control over which runtime the user is in or if it's ESM or CommonJS** so we should support both.

Cool, so it created the file and dynamically imported, now the user can use it normally. On an ideal environment this will happen just once. The Users can set `instance` on the model's `options` passing that created instance, this way on runtime we will not translate that model, it uses what is passed to them, and increase startup performance by a bunch. **BUT** you know how users are.. Specially developers. You can also speed it up on your end. You can detect if it's a production or dev environment and bypass the translation entirely if you want to. You can check which models are created and which are not created and just optimize it in a bunch of ways. You can also require from the users to set specific config values on `.new()` of your engine instance. We don't have any guardrails on that.

## The methods

We already covered a few of them and they are kinda self explanatory, but don't worry we will cover each of them. The two ones that are obligatory to be implemented are `translate` and `translateOptions`.

### The translation starts

The `translate` is where everything starts. We will give you a couple of things to get started:

- **engine** - The instance of your DatabaseAdapter. Don't type it directly as it might mess with the typing.
- **modelName** - The name of the model that is being translated.
- **model** - The Palmares model instance so we can translate it.
- **fieldEntriesOfModel** - The field entries of the model. It's an array of tuples where the first element is the field name and the second is the field.
- **modelOptions** - The options of the model that is being translated.
- **defaultTranslateCallback** - Instead of manually calling the `translateFields` and `translateOptions` methods, you can call this function and it will do that for you. It will return an object with the `options` and `fields` keys. The `options` key will be the return of the `translateOptions` method and the `fields` key will be the return of the `translateFields` method.
- **defaultTranslateFieldCallback** - This is passed here so you can pass to `translateFields` if you wish to call it manually.
- **defaultTranslateFieldsCallback** - This is passed here so you can pass to `translateFields` if you wish to call it manually.

As you can see, both engines call `defaultTranslateCallback`, that's the first thing they do. It will automatically loop through all the fields and get the translated data from each field. Everything is done automatically for you. We will cover the field translation step, don't worry. For now what you need to understand is that fields that return `undefined` from their `translate()` method are completely ignored and not added to the final object that is returned for you.

On Sequelize we are also creating the model instance, so translate is doing that. On Drizzle we chose not to do any transformation just yet. Remember, we are creating a file essentially, so we can just finalize to construct the model string when the translation of all the model ends.

### Building a file? Needs to relate the models together? What do you need?

`afterModelTranslation` is exactly that: Called when the translation of the model ends. That's where you usually will use to create the files, if you are creating the files. That's not the only use case though, you can also do any pending relations here; you can take some models out; you can. If you need to do a final touch with your models after all of them are created you should use this function.

As you can see it's really simple: An array of model tuples where the first element is the **model name** and second element is the **model** comes in, and then you loop through those models, do whatever you need to do, and return an array on the same format.

For Drizzle, as we said, we are using it to create the files. At the same time, Drizzle requires to build relations calling a special `relations` function. This is done outside of each model, you pass each model you want to relate to on that special function. That's the perfect place to do it. Also, you might be curious on why we are building the actual models from there. Because since we are creating a javascript file we should have control of the imports from the top of the file.

### Translating the options

The only reason `translateOptions` is required is to translate the options of the model. You might ask why is this not on `translate` method since that essentially it is translating the model. We though it might be confusing that the `translate` method will be responsible for a lot of things, so we added this. This holds the table name that the model represents, the indexes, a default ordering, etc. You can check what are the options from the model by creating a model.

### The other methods

- `translateFields` - We said that we loop through all fields, translate each field and create an object with that, but that might not be what you need. If you want to override the custom implementation you can use this method.
- `compare` - Compare two models with each other. By default we will try to transform the custom options using JSON.stringify and trying to compare, but this can cause a lot of issues. You can use this to compare two models with each other.
- `modelToString` - Transforms the model into a string. This is for customOptions, when the user is creating a new migration.
- `customOptions` - Adds type-safety when the user is defining custom options, you just need to properly type the arguments.

## Up Next

[Translating the fields](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/integrators/getting-started/the-fields.md)
