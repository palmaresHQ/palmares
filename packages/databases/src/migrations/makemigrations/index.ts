import { FRAMEWORK_NAME, logging, Domain } from '@palmares/core';

import {
  EmptyOptionsOnGenerateFilesType,
  FieldOrModelParamType
} from './types';
import { FoundMigrationsFileType, OriginalOrStateModelsByNameType } from '../types';
import {
  DatabaseSettingsType,
  InitializedEngineInstancesType,
  InitializedModelsType,
  OptionalMakemigrationsArgsType
} from '../../types';
import State from '../state';
import Asker from './asker';
import { ModelFieldsType } from '../../models/types';
import { Field } from '../../models/fields';
import { ActionToGenerateType } from '../actions/types';
import {
  getUniqueCustomImports,
  LOGGING_MIGRATIONS_ACTION_DESCRIPTION,
  LOGGING_MIGRATIONS_FILE_DESCRIPTION,
  LOGGING_MIGRATIONS_FILE_TITLE,
  LOGGING_NO_CHANGES_MADE_FOR_MIGRATIONS,
  PACKAGE_NAME
} from '../../utils';
import * as actions from '../actions';

import { join } from 'path';
import { existsSync, mkdir, writeFile } from 'fs';
import { CustomImportsForFieldType } from '../../models/fields/types';


/**
 * Class used for creating migrations, right now we keep everything in a single file. But we might separate it after.
 *
 * The main and only method you are able to call is the factory method `.buildAndRun()`. So we will build the class
 * and generate the migrations automatically for the user.
 *
 * All of the migrations must pass through this class, even for empty migrations, if the user does not use this for
 * generating migrations errors might happen.
 */
export default class MakeMigrations {
  #originalModelsByName!: OriginalOrStateModelsByNameType;
  #stateModelsByName!: OriginalOrStateModelsByNameType;
  settings: DatabaseSettingsType;
  database: string;
  filteredMigrationsOfDatabase: FoundMigrationsFileType[];
  optionalArgs: OptionalMakemigrationsArgsType;

  constructor(
    database: string,
    settings: DatabaseSettingsType,
    originalModels: InitializedModelsType[],
    stateModels: InitializedModelsType[],
    filteredMigrationsOfDatabase: FoundMigrationsFileType[],
    optionalArgs: OptionalMakemigrationsArgsType
  ) {
    this.database = database;
    this.filteredMigrationsOfDatabase = filteredMigrationsOfDatabase;
    this.optionalArgs = optionalArgs;
    this.settings = settings;
    this.modelsArrayToObjectByName(originalModels, stateModels);
  }

  /**
   * Adds the initialized models array to an object where the keys are the model name and the values are the
   * initialized model. We do this to both the original ones (defined in the application) and the models.
   *
   * @param originalModels - The models inside of the application, the ones defined in the models.(js/ts) file
   * or retrieved in the `getModels` method inside of the domain.
   * @param stateModels - The models built by the state, we run each migration in order and retrieve the state
   * of it, one after the other.
   */
  modelsArrayToObjectByName(originalModels: InitializedModelsType[], stateModels: InitializedModelsType[]): void {
    this.#originalModelsByName = {};
    this.#stateModelsByName = {};

    for (const originalModel of originalModels) {
      this.#originalModelsByName[originalModel.original.originalName] = originalModel;
    }

    for (const stateModel of stateModels) {
      this.#stateModelsByName[stateModel.original.originalName] = stateModel;
    }
  }

  /**
   * This is used to verify if the models or the fields have been renamed, changed, created or removed.
   * We do it in a single and big function but probably you could separate it in less methods.
   *
   * Sometimes we cannot infer things so we need to ask the user if he really changed or not a model or a field.
   * That's because we might have cases where we might not be sure if the model or field was renamed or not. To
   * make it clear for the user it's better to ask so we use the 'Asker' instance to do this.
   *
   * How we find if anything was changed, created, removed or renamed is the same for models and fields so we use the
   * same method for both.
   *
   * Last but not least the operations are updated by reference (you know what it means to pass a value by value and
   * by reference?) We pass an array to operations we update it as we look to changes between the state and the models
   * defined in your application.
   *
   * @param originalModelsByNameOrFields - This param are the models or fields defined by the user, this is how the user
   * wants the data to be. It is an object where the key is the name of the field or of the model and the value is the
   * initialized model or the field instance.
   * @param stateModelsByNameOrFields - This param are the models or fields reconstructed by running each migration in order.
   * So this is how those models were before any change.
   * @param fieldOrModel - Are you running this on an object of fields or on an object of models?
   * @param operations - The array where we will hold all of the operations that we need to do in our migration.
   */
  async #getOperationsFromModelsOrFields(
    originalModelsByNameOrFields: OriginalOrStateModelsByNameType | ModelFieldsType,
    stateModelsByNameOrFields: OriginalOrStateModelsByNameType | ModelFieldsType,
    fieldOrModel: FieldOrModelParamType = 'model',
    operations: ActionToGenerateType<any>[] = []
  ): Promise<void> {
    const appendOperation = (operation: undefined | ActionToGenerateType<any>) => operation ? operations.push(operation) : null;
    const originalModelOrFieldEntries: [string, Field | InitializedModelsType][] = Object.entries(originalModelsByNameOrFields);
    const stateModelOrFieldEntries: [string, Field | InitializedModelsType][] = Object.entries(stateModelsByNameOrFields);

    const modelsOrFieldsInOriginalButNotDefinedInState = [];
    const modelsOrFieldsInStateButNotDefinedInOriginal = [];

    // Check if something is in state that is not on original. In other words, check if any field or model was removed
    for (const [stateFieldOrModelName, stateFieldOrModelObject] of stateModelOrFieldEntries) {
      const didRenamedFieldNameOrModelName = originalModelsByNameOrFields[stateFieldOrModelName] === undefined;

      if (didRenamedFieldNameOrModelName) {
        if (originalModelOrFieldEntries.length === stateModelOrFieldEntries.length) {
          // ask if user renamed
          let renamedTo = '';
          for (let i=0; i<originalModelOrFieldEntries.length; i++) {
            const originalModelOrFieldName = originalModelOrFieldEntries[i][0];
            const hasTheUserRenamedTheModel = stateModelsByNameOrFields[originalModelOrFieldName] === undefined;

            if(hasTheUserRenamedTheModel) {
              renamedTo = originalModelOrFieldName;
              break;
            }
          }

          if (await Asker.didUserRename(stateFieldOrModelName, renamedTo)) {
            const originalModelOrField = originalModelsByNameOrFields[renamedTo];

            appendOperation(
              await this.#callbackIfRenamed(
                fieldOrModel,
                stateFieldOrModelName,
                renamedTo,
                originalModelOrField
              )
            );

            // We change the name of the state model or field to the actual name, so we can compare other stuff
            // also now when we loop though the original models or field it will not catch as it was renamed
            stateModelsByNameOrFields[renamedTo] = stateFieldOrModelObject;
            delete stateModelsByNameOrFields[stateFieldOrModelName];
          } else {
            appendOperation(
              await this.#callbackIfDeleted(fieldOrModel, stateFieldOrModelName, stateFieldOrModelObject)
            );
          }
        } else {
          // we cannot make guesses, for example in case like originalFields = {parameterName, name},
          // stateFields={createdAt}. it's not clear that one of {parameterName} or {name} was added and
          // the other was renamed, or both of them could be added and {createdAt} would be removed,
          // it's not clear for us, so we need to prompt the user in that use case

          // For cases like originalFields = {parameterName, name} and stateFields={}, it's clear that both was added.
          // Or if originalFields={} and stateFields={createdAt} it's clear that one was removed so we
          // can make safe guesses
          modelsOrFieldsInStateButNotDefinedInOriginal.push(stateFieldOrModelName);
        }
      }
    }

    for (const [originalFieldOrModelName, originalFieldOrModelObject] of originalModelOrFieldEntries) {
      const stateFieldOrModelObject = stateModelsByNameOrFields[originalFieldOrModelName];
      const hasCreatedANewFieldOrModel =  stateFieldOrModelObject === undefined;
      // created
      if (hasCreatedANewFieldOrModel) {
        // we already asked and changed the state so a new was definitely created
        const wereAModelOrFieldCreated = originalModelOrFieldEntries.length === stateModelOrFieldEntries.length;
        if (wereAModelOrFieldCreated) {
          appendOperation(
            await this.#callbackIfCreated(fieldOrModel, originalFieldOrModelName, originalFieldOrModelObject)
          );
        } else {
          // we cannot make guesses, for example in case like originalFields = {parameterName, name},
          // stateFields={createdAt}. It's not clear that one of {parameterName} or {name} was added and the
          // other was renamed, or both of them could be added and {createdAt}
          // would be removed, it's not clear for us, so we need to prompt the user in that use case

          // For cases like originalFields = {parameterName, name} stateFields={}, it's clear that both was added. Or if {} {createdAt} it's clear that
          // one was removed so we can make safe guesses
          modelsOrFieldsInOriginalButNotDefinedInState.push(originalFieldOrModelName);
        }
      } else {
        appendOperation(
          await this.#callbackIfChanged(
            operations,
            fieldOrModel,
            originalFieldOrModelName,
            stateFieldOrModelObject,
            originalFieldOrModelObject
          )
        );
      }
    }

    // on this case we can safely guess it was added
    const wereModelsOrFieldsCreated = modelsOrFieldsInOriginalButNotDefinedInState.length > 0 &&
      modelsOrFieldsInStateButNotDefinedInOriginal.length === 0;

    const wereModelsOrFieldsDeleted = modelsOrFieldsInStateButNotDefinedInOriginal.length > 0 &&
    modelsOrFieldsInOriginalButNotDefinedInState.length === 0;
    if (wereModelsOrFieldsCreated) {
      for (const originalFieldOrModelNameToAdd of modelsOrFieldsInOriginalButNotDefinedInState) {
        const originalFieldOrModelObject = originalModelsByNameOrFields[originalFieldOrModelNameToAdd];
        appendOperation(
          await this.#callbackIfCreated(fieldOrModel, originalFieldOrModelNameToAdd, originalFieldOrModelObject)
        );
      }
    } else if (wereModelsOrFieldsDeleted) {
      // we can safely guess it was removed
      for (const stateFieldOrModelNameToRemove of modelsOrFieldsInStateButNotDefinedInOriginal) {
        const stateFieldOrModelObject = stateModelsByNameOrFields[stateFieldOrModelNameToRemove];
        appendOperation(
          await this.#callbackIfDeleted(fieldOrModel, stateFieldOrModelNameToRemove, stateFieldOrModelObject)
        );
      }
    } else {
      const nonRenamedFieldsOrModels = [...modelsOrFieldsInOriginalButNotDefinedInState]
      // same as before, first we loop through state objects and then we loop through newly defined models

      for (const fieldOrModelNameInState of modelsOrFieldsInStateButNotDefinedInOriginal) {
        let answer: null | string = null;
        const didTheUserRenamedToOneOfTheOptions = nonRenamedFieldsOrModels.length !== 0;

        if (didTheUserRenamedToOneOfTheOptions) {
          answer = await Asker.didUserRenameToOneOption(fieldOrModelNameInState, nonRenamedFieldsOrModels);
        }

        const stateFieldOrModelObject = stateModelsByNameOrFields[fieldOrModelNameInState];
        const didTheUserDeletedTheFieldOrTheModel = answer === null;
        if (didTheUserDeletedTheFieldOrTheModel) {
          // was deleted
          appendOperation(
            await this.#callbackIfDeleted(fieldOrModel, fieldOrModelNameInState, stateFieldOrModelObject)
          )
        } else {
          const answerAsString = answer as string;
          // was renamed
          const originalModelOrFieldObject = originalModelsByNameOrFields[answerAsString];
          appendOperation(
            await this.#callbackIfRenamed(
              fieldOrModel,
              fieldOrModelNameInState,
              answerAsString,
              originalModelOrFieldObject
            )
          )

          const indexOfSelectedAnswer = nonRenamedFieldsOrModels.indexOf(answerAsString);
          nonRenamedFieldsOrModels.splice(indexOfSelectedAnswer, 1);

          // We change the name of the state model to the actual name, so we can compare other stuff
          // also now when we loop though the original models it will not catch as it was renamed
          stateModelsByNameOrFields[answerAsString] = stateFieldOrModelObject;
          delete stateModelsByNameOrFields[fieldOrModelNameInState]
        }
      }

      for (const fieldOrModelNameInOriginal of modelsOrFieldsInOriginalButNotDefinedInState) {
        const originalFieldOrModelObject = originalModelsByNameOrFields[fieldOrModelNameInOriginal];
        const stateFieldOrModelObject = stateModelsByNameOrFields[fieldOrModelNameInOriginal];

        if (stateFieldOrModelObject === undefined) {
          // we already asked and changed the state so a new was definitely created
          appendOperation(
            await this.#callbackIfCreated(fieldOrModel, fieldOrModelNameInOriginal, originalFieldOrModelObject)
          );
        } else {
          appendOperation(
            await this.#callbackIfChanged(
              operations,
              fieldOrModel,
              fieldOrModelNameInOriginal,
              stateFieldOrModelObject,
              originalFieldOrModelObject
            )
          );
        }
      }
    }
  }

  async #callbackIfRenamed(
    fieldOrModel: FieldOrModelParamType,
    fieldOrModelName: string,
    renamedTo: string,
    originalModelOrField: Field | InitializedModelsType
  ): Promise<ActionToGenerateType<any>> {
    switch (fieldOrModel) {
      case 'field':
        const originalField = originalModelOrField as Field;
        return actions.RenameField.toGenerate(
          originalField.model.domainName,
          originalField.model.domainPath,
          originalField.model.originalName,
          {
            fieldDefinition: originalField,
            fieldNameAfter: renamedTo,
            fieldNameBefore: fieldOrModelName
          }
        );
      case 'model':
        const originalInitializedModel = originalModelOrField as InitializedModelsType;
        return actions.RenameModel.toGenerate(
          originalInitializedModel.domainName,
          originalInitializedModel.domainPath,
          renamedTo,
          {
            modelNameAfter: renamedTo,
            modelNameBefore: fieldOrModelName
          }
        );
    }
  }

  async #callbackIfDeleted(
    fieldOrModel: FieldOrModelParamType,
    fieldOrModelName: string,
    stateFieldOrModel: Field | InitializedModelsType
  ): Promise<ActionToGenerateType<any>>  {
    switch (fieldOrModel) {
      case 'field':
        const stateField = stateFieldOrModel as Field;
        return actions.DeleteField.toGenerate(
          stateField.model.domainName,
          stateField.model.domainPath,
          stateField.model.originalName,
          {
            fieldName: fieldOrModelName
          }
        );
      case 'model':
        const stateInitializedModel = stateFieldOrModel as InitializedModelsType;
        return actions.DeleteModel.toGenerate(
          stateInitializedModel.domainName,
          stateInitializedModel.domainPath,
          fieldOrModelName
        );
    }
  }

  async #callbackIfChanged(
    operations: ActionToGenerateType<any>[],
    fieldOrModel: FieldOrModelParamType,
    fieldOrModelName: string,
    stateFieldOrModel: Field | InitializedModelsType,
    originalFieldOrModel: Field | InitializedModelsType
  ): Promise<ActionToGenerateType<any> | undefined>  {
    switch (fieldOrModel) {
      case 'field':
        return await this.#fieldWasUpdated(
          fieldOrModelName, stateFieldOrModel as Field, originalFieldOrModel as Field
        );
      case 'model':
        return await this.#modelWasUpdated(
          operations,
          fieldOrModelName,
          stateFieldOrModel as InitializedModelsType, originalFieldOrModel as InitializedModelsType
        );
    }
  }

  async #callbackIfCreated(
    fieldOrModel: FieldOrModelParamType,
    fieldOrModelName: string,
    originalFieldOrModel: Field | InitializedModelsType
  ): Promise<ActionToGenerateType<any>>  {
    switch (fieldOrModel) {
      case 'field':
        const originalField = originalFieldOrModel as Field;
        const fieldName = fieldOrModelName;
        const isDefaultValueNotDefinedAndFieldDoesNotAllowNull = originalField.defaultValue === undefined &&
        originalField.allowNull === false;
        if (isDefaultValueNotDefinedAndFieldDoesNotAllowNull) {
          const answer = await Asker.theNewAttributeCantHaveNullDoYouWishToContinue(
            originalField.model.originalName,
            fieldName
          );
          if (answer === false) {
            return process.exit(1);
          }
        }
        return actions.CreateField.toGenerate(
          originalField.model.domainName,
          originalField.model.domainPath,
          originalField.model.originalName,
          {
            fieldDefinition: originalField,
            fieldName: fieldName
          }
        );
      case 'model':
        const originalInitializedModel = originalFieldOrModel as InitializedModelsType;
        return actions.CreateModel.toGenerate(
          originalInitializedModel.domainName,
          originalInitializedModel.domainPath,
          fieldOrModelName,
          {
            fields: originalInitializedModel.original.fields,
            options: originalInitializedModel.original.options
          }
        );
    }
  }

  async #modelWasUpdated(
    operations: ActionToGenerateType<any>[],
    modelName: string,
    stateInitializedModel: InitializedModelsType,
    originalInitializedModel: InitializedModelsType
  ) {
    let response = undefined;
    const areModelsEqual = await originalInitializedModel.original._compareModels(stateInitializedModel.original);
    if (!areModelsEqual) {
      response = actions.ChangeModel.toGenerate(
        originalInitializedModel.domainName,
        originalInitializedModel.domainPath,
        modelName,
        {
          optionsAfter: originalInitializedModel.original.options,
          optionsBefore: stateInitializedModel.original.options
        }
      )
    }
    await this.#getOperationsFromModelsOrFields(
      originalInitializedModel.original.fields,
      stateInitializedModel.original.fields,
      'field',
      operations
    );
    return response;
  }

  async #fieldWasUpdated(fieldName: string, stateField: Field, originalField: Field) {
    const areFieldsEqual = await originalField.compare(stateField);
    if (!areFieldsEqual) {
      return actions.ChangeField.toGenerate(
        originalField.model.domainName,
        originalField.model.domainPath,
        originalField.model.originalName,
        {
          fieldDefinitionAfter: originalField,
          fieldDefinitionBefore: stateField,
          fieldName: fieldName
        }
      )
    }
  }

  /**
   * Method for reordering the migrations so no dependent migration will come first than the other. For example:
   * We have two models: `Post` and `User`. `Post` have`a dependency of `User` with an user_id field.
   * When we are creating this model in the database we must guarantee that the `User` will be created in the database
   * before creating `Post`.
   *
   * This dependencies occur even if we are changing a model, for example, if User didn't exist before and we are
   * creating the `User` model at the same time we are adding `user_id` to the `Post` model this dependency will exist.
   *
   * For that we need to reorder the operations. We do this in a while loop so we can guarantee all of the dependencies are
   * satisfied before creating the model.
   *
   * @param operations - The operations list unordered that you want to be ordered respecting all of the dependencies
   * between models.
   *
   * @returns - The operations but ordered, respecting the dependencies of the models.
   */
  async #reorderOperations(operations: ActionToGenerateType<any>[]): Promise<ActionToGenerateType<any>[]> {
    const reorderedOperations = [];
    let pendingOperations = operations;
    let previousNumberOfReorderedOperations = -1;
    while (pendingOperations.length > 0) {
      const newPendingOperations = [];
      for (const operationToProcess of pendingOperations) {
        const modelOfOperationToProcess = this.#originalModelsByName[operationToProcess.modelName] !== undefined ?
          this.#originalModelsByName[operationToProcess.modelName] : this.#stateModelsByName[operationToProcess.modelName];
        const hasNoDependencies = modelOfOperationToProcess.original._dependentOnModels.length === 0;
        const addedModels = new Set(reorderedOperations.map(operation => operation.modelName));
        const dependenciesAlreadyAdded = modelOfOperationToProcess.original._dependentOnModels
          .every(dependencyOfModel =>
            addedModels.has(dependencyOfModel) ||
            dependencyOfModel === modelOfOperationToProcess.original.originalName // For circular relations.
          );
        // this means it is the last run so we must add any pending migrations.
        const didNotAddAnyPendingOperationInThePreviousRun =
          previousNumberOfReorderedOperations === reorderedOperations.length;
        if (hasNoDependencies || dependenciesAlreadyAdded || didNotAddAnyPendingOperationInThePreviousRun) {
          operationToProcess.order = reorderedOperations.length;
          reorderedOperations.push(operationToProcess);
        } else {
          newPendingOperations.push(operationToProcess);
        }
      }
      previousNumberOfReorderedOperations = reorderedOperations.length;
      pendingOperations = newPendingOperations;
    }
    return reorderedOperations;
  }

  /**
   * Method used for generating the migration file from the operations. We will make a migration file for each database.
   * So if you use multiple databases you will end up with multiple migration files, one for each database. This was better
   * because we thought about that. The first idea was to add the migrations from multiple databases in a single file.
   * This is not good because you can't have easy access from which database this migration is from. On the other hand,
   * by splitting into multiple files we are able to see directly in the file name from which file this migration is from.
   *
   * Every migration has a description so the user can know what we are doing in this automatically generated migration.
   *
   * The automatic migrations are composed like so:
   * `{ordered number}_{database name}_auto_migration_{time when it was generated}`
   *
   * Sometimes the user might define something outside of the default application scope. For that use cases we can import
   * stuff dynamically. For example, if you create a customField supposed to work specifically for sequelize-engine, you
   * can add a `customImports` function for that field so we are able to add that import on the top of the migration file.
   *
   * @param operationsOfFile - All of the operations, in order, that we want to run inside of this migration.
   * @param domainPath - Where are we going to create this migration file.
   * @param numberOfMigrations - (optional) - The number of migrations that were created in this single makemigrations
   * run. This is useful so we can append the numbers accordingly.
   * @param lastMigrationName - (optional) - The last migration name that this depends on, most of them will have dependencies
   * on each one, except for the first one.
   * @param lastDomainPath - (optional) - Where the dependent migration was generated so we can look at it if we want to.
   *
   * @returns - Returns the migration name automatically generated here in this function.
   */
  async #generateMigrationFile(
    operationsOfFile: ActionToGenerateType<any>[],
    domainPath: string,
    numberOfMigrations = 0,
    lastMigrationName = '',
    lastDomainPath = ''
  ) {
    const customImportsOfCustomData: CustomImportsForFieldType[] = [];
    const operationsAsString: string[] = [];
    const currentDate = new Date();
    const migrationNumber = numberOfMigrations + 1;
    const migrationNumberToString = migrationNumber < 10 ? `00${migrationNumber}` :
      migrationNumber < 100 ? `0${migrationNumber}` : migrationNumber;
    const migrationName = `${migrationNumberToString}_${this.database}_auto_migration_${Date.now().toString()}`;

    logging.logMessage(LOGGING_MIGRATIONS_FILE_TITLE, { title: migrationName });
    logging.logMessage(LOGGING_MIGRATIONS_FILE_DESCRIPTION, {
      database: this.database,
      lastMigrationName,
      lastDomainPath
    });

    for (const operation of operationsOfFile) {
      logging.logMessage(LOGGING_MIGRATIONS_ACTION_DESCRIPTION, {
        description: await operation.operation.describe(operation)
      });
      const { asString, customImports } = await operation.operation.toString(3, operation);
      operationsAsString.push(asString);

      if (Array.isArray(customImports)) {
        getUniqueCustomImports(customImports, customImportsOfCustomData);
      }
    }
    const operationsToString = operationsAsString.join(',\n');
    const customImportsAsString = customImportsOfCustomData.map(({value, packageName}) => {
      if (this.settings?.USE_TS) return `import ${value} from "${packageName}";`;

      if (value.startsWith('* as ')) return `const ${value.replace('* as ', '')} = require("${packageName}");`;
      if (value.startsWith('{ default as ')) {
        return `const ${value.replace('{ default as ', '').replace(' }', '')} = require("${packageName}");`;
      }
      return `const { ${value} } = require(${packageName});`;
    }).join('\n') + `\n`;

    const file = `/**\n * Automatically generated by ${FRAMEWORK_NAME} on ${currentDate.toISOString()}\n */\n\n`+
    (this.settings?.USE_TS ? `import { models, actions } from "${PACKAGE_NAME}";` :
    `const { models, actions } = require("${PACKAGE_NAME}");`) +
    `\n${customImportsAsString}\n` +
    (this.settings?.USE_TS ? `export default {\n` : `module.exports = {\n`) +
    `  name: '${migrationName}',\n  database: "${this.database}",\n` +
    `  dependsOn: "${lastMigrationName}",\n` +
    `  operations: [\n${operationsToString}\n  ]\n};\n`;

    const pathToWriteMigrations = join(domainPath, 'migrations');
    if (!existsSync(pathToWriteMigrations)) {
      await new Promise((resolve, reject) => {
        try {
          mkdir(pathToWriteMigrations, () => {
            resolve(undefined);
          });
        } catch (e) {
          reject(e);
        }
      });
      await new Promise((resolve, reject) => {
        writeFile(join(pathToWriteMigrations, `index.${this.settings?.USE_TS ? 'ts' : 'js'}`), '', (error) => {
          if (error) reject(error);
          resolve(undefined);
        });
      });
    }

    await new Promise((resolve, reject) => {
      writeFile(
        join(pathToWriteMigrations, `${migrationName}.${this.settings?.USE_TS ? 'ts' : 'js'}`),
        file,
        (error) => {
          if (error) reject(error);
          resolve(undefined);
        }
      );
    });

    return migrationName;
  }

  /**
   * Method responsible for condensing the operations in a single file. For example, let's suppose we have two Domains:
   * `auth` and `posts`, on the `posts` domain we have the `Post` model and on the `auth` domain we have the `User`
   * model. So let's suppose we did 3 operations after the last migrations:
   *
   * 1. We've added a new field in 'Post' called `dateOfPost`.
   * 2. We've set in the 'Post' model, on the the existing field `description` as `allowBlank = true`.
   * 3. On the `User` model we've added a new `dateJoined` field.
   *
   * operations 1 and 2 are related to the model `Post` that is located in the `posts` domain.
   * The operation 3 is related to the model `User` that is located in the `auth` domain.
   *
   * This means that operations 1 and 2 must exist in a single file, and the operation 3 should exist in other.
   * THat's exactly what we do in this function we merge operations related to the same domain in a single file so we
   * don't need one file for each operation.
   *
   * @param operations - All of the operations that we need to run for this database. We will separate them to their files
   * inside of this method.
   * @param emptyOptions - (optional) - Those are the custom options if the value is an empty migration. An empty
   * migration is a migration file without any operations. This is preferred instead of creating the file by hand.
   *
   * @returns - Returns the last migration name.
   */
  async generateFiles(
    operations: ActionToGenerateType<any>[],
    emptyOptions?: EmptyOptionsOnGenerateFilesType
  ) {
    const lastMigrationIndex = this.filteredMigrationsOfDatabase.length - 1;
    const hasALastMigration = this.filteredMigrationsOfDatabase[lastMigrationIndex] !== undefined;
    const previousDomainPath = operations[0] ? operations[0].domainPath : '';
    let lastDomainPath = hasALastMigration?
      this.filteredMigrationsOfDatabase[lastMigrationIndex].domainPath : '';
    let lastMigrationName = hasALastMigration ?
      this.filteredMigrationsOfDatabase[lastMigrationIndex].migration.name :
      '';
    let numberOfMigrationFilesCreated = 0;
    let operationsOnFile: ActionToGenerateType<any>[] = [];

    for (let i=0; i<operations.length + 1; i++) {
      const operation = operations[i];
      const isLastOperationOrFromADifferentDomain = i >= operations.length ||
        operation.domainPath !== previousDomainPath;

      if (isLastOperationOrFromADifferentDomain) {
        const domainPath = operationsOnFile[0] ? operationsOnFile[0].domainPath : previousDomainPath;
        const totalNumberOfMigrations = this.filteredMigrationsOfDatabase.length + numberOfMigrationFilesCreated;
        const migrationName = await this.#generateMigrationFile(
          operationsOnFile,
          emptyOptions?.onDomain || domainPath,
          totalNumberOfMigrations,
          emptyOptions?.previousMigrationName || lastMigrationName,
          emptyOptions?.onDomain || lastDomainPath
        );

        numberOfMigrationFilesCreated++;
        lastDomainPath = domainPath;
        lastMigrationName = migrationName;
        operationsOnFile = [];
      }
      operationsOnFile.push(operation);
    }
    return lastMigrationName;
  }

  /**
   * This will handle when the user wants to create an empty migration file without any operations in it.
   *
   * To create an empty migration file the user must define the domain name were he wants to add the migration,
   * for example `AuthDomain`. By default this will create this empty migration file for all of the databases
   * that he has but the user can define for which database does he want this empty migration to be created
   * for by defining it like: `default:AuthDomain`. This guarantees that this migration will only exist for
   * the `default` database.
   *
   * @param previousMigrationName - The last run migration so we can add the dependencies accordingly.
   */
  async #handleGenerateEmptyMigration(
    previousMigrationName?: string
  ) {
    const isArgsAString = typeof this.optionalArgs?.empty === 'string';
    const isToGenerateMigration = (domain: string) => {
      const separatedArg = (this.optionalArgs.empty as string).split(':');
      if (separatedArg.length > 1) {
        return this.database === separatedArg[0] && domain === separatedArg[1]
      }
      return domain === this.optionalArgs.empty
    }
    if (isArgsAString) {
      const domainClasses = await Domain.retrieveDomains(this.settings);
      for (const domainClass of domainClasses) {
        const domain = new domainClass();
        if (isToGenerateMigration(domain.name)) {
          await this.generateFiles(
            [], {
              onDomain: domain.path,
              previousMigrationName
            }
          );
          break;
        }
      }
    }
  }

  /**
   * This is the main entrypoint for the `makemigrations` command. We run this function and the
   * side effects run in order so we are able to retrieve the operations that we need to do in the database
   * to match the changes that were made to the models.
   *
   * First we need to retrieve all of the operations, second we need to reorder those operations, and last but not least
   * we generate the file.
   * If the `makemigrations` has the `--empty` flag in it then we create an empty migration after every migration were
   * created.
   */
  async _run() {
    let previousMigrationName: string | undefined = undefined;
    const operations: ActionToGenerateType<any>[] = [];
    await this.#getOperationsFromModelsOrFields(
      this.#originalModelsByName, this.#stateModelsByName, 'model', operations
    );
    const didNotChangeAnythingInTheModels = operations.length === 0;
    if (didNotChangeAnythingInTheModels) {
      if (!this.optionalArgs?.empty) logging.logMessage(LOGGING_NO_CHANGES_MADE_FOR_MIGRATIONS);
    } else {
      const reorderedMigrations = await this.#reorderOperations(operations);
      previousMigrationName = await this.generateFiles(reorderedMigrations);
    }

    // Optional empty
    if (this.optionalArgs?.empty) await this.#handleGenerateEmptyMigration(previousMigrationName);
  }

  static async buildAndRun(
    settings: DatabaseSettingsType,
    migrations: FoundMigrationsFileType[],
    initializedEngineInstances: InitializedEngineInstancesType,
    optionalArgs: OptionalMakemigrationsArgsType
  ) {
    const initializedEngineInstancesEntries = Object.entries(initializedEngineInstances);
    for (const [database, { engineInstance, projectModels }] of initializedEngineInstancesEntries) {
      const filteredMigrationsOfDatabase = migrations.filter(migration =>
        [database, '*'].includes(migration.migration.database)
      );
      const state = await State.buildState(filteredMigrationsOfDatabase);
      const initializedState = await state.initializeModels(engineInstance);
      const makemigrations = new this(
        database,
        settings,
        projectModels,
        initializedState,
        filteredMigrationsOfDatabase,
        optionalArgs
      );
      await makemigrations._run();
    }
  }
}
