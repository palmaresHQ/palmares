import { FRAMEWORK_NAME, logging } from '@palmares/core';

import { FieldOrModelParamType, OriginalOrStateModelsType } from './types';
import { FoundMigrationsFileType } from '../types';
import { DatabaseSettingsType, InitializedEngineInstancesType, InitializedModelsType } from '../../types';
import State from '../state';
import Asker from './asker';
import { ModelFieldsType } from '../../models/types';
import { Field } from '../../models/fields';
import { ActionToGenerateType } from '../actions/types';
import { LOGGING_NO_CHANGES_MADE_FOR_MIGRATIONS, PACKAGE_NAME } from '../../utils';
import * as actions from '../actions';

/**
 * Class used for creating migrations, right now we keep everything in a single file. But we might separate it after.
 *
 * The main and only method you are able to call are both `.run` but it's better if you just use the factory method:
 * `.buildAndRun()`. So we will build the class and generate the migrations automatically for the user.
 *
 * All of the migrations must pass through this class, even for empty migrations, if the user does not use this for
 * generating migrations errors might happen.
 */
export default class MakeMigrations {
  #originalModelsByName!: OriginalOrStateModelsType;
  #stateModelsByName!: OriginalOrStateModelsType;
  settings: DatabaseSettingsType;

  constructor(
    settings: DatabaseSettingsType,
    originalModels: InitializedModelsType[],
    stateModels: InitializedModelsType[]
  ) {
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
    originalModelsByNameOrFields: OriginalOrStateModelsType | ModelFieldsType,
    stateModelsByNameOrFields: OriginalOrStateModelsType | ModelFieldsType,
    fieldOrModel: FieldOrModelParamType = 'model',
    operations: ActionToGenerateType<any>[] = []
  ): Promise<void> {
    const appendOperation = (operation: undefined | ActionToGenerateType<any>) => operation ? operations.push(operation) : null;
    const originalModelOrFieldEntries: [string, Field | InitializedModelsType][] = Object.entries(originalModelsByNameOrFields);
    const stateModelOrFieldEntries: [string, Field | InitializedModelsType][] = Object.entries(stateModelsByNameOrFields);

    let modelsOrFieldsInOriginalButNotDefinedInState = [];
    let modelsOrFieldsInStateButNotDefinedInOriginal = [];

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
      let nonRenamedFieldsOrModels = [...modelsOrFieldsInOriginalButNotDefinedInState]
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
    if (fieldOrModel === 'field') {
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
    } else {
      const originalInitializedModel = originalModelOrField as InitializedModelsType;
      return actions.RenameModel.toGenerate(
        originalInitializedModel.domainName,
        originalInitializedModel.domainPath,
        renamedTo,
        {
          modelNameAfter: renamedTo,
          modelNameBefore: fieldOrModelName
        }
      )
    }
  }

  async #callbackIfDeleted(
    fieldOrModel: FieldOrModelParamType,
    fieldOrModelName: string,
    stateFieldOrModel: Field | InitializedModelsType
  ): Promise<ActionToGenerateType<any>>  {
    if (fieldOrModel === 'field') {
      const stateField = stateFieldOrModel as Field;
      return actions.DeleteField.toGenerate(
        stateField.model.domainName,
        stateField.model.domainPath,
        stateField.model.originalName,
        {
          fieldName: fieldOrModelName
        }
      );
    } else {
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
    if (fieldOrModel === 'field') return await this.#fieldWasUpdated(
      fieldOrModelName, stateFieldOrModel as Field, originalFieldOrModel as Field
    );
    else return await this.#modelWasUpdated(
      operations,
      fieldOrModelName,
      stateFieldOrModel as InitializedModelsType, originalFieldOrModel as InitializedModelsType
    );
  }

  async #callbackIfCreated(
    fieldOrModel: FieldOrModelParamType,
    fieldOrModelName: string,
    originalFieldOrModel: Field | InitializedModelsType
  ): Promise<ActionToGenerateType<any>>  {
    if (fieldOrModel === 'field') return await this.#fieldWasCreated(fieldOrModelName, originalFieldOrModel as Field);
    else return await this.#modelWasCreated(fieldOrModelName, originalFieldOrModel as InitializedModelsType);
  }

  async #modelWasCreated(modelName: string, originalInitializedModel: InitializedModelsType) {
    return actions.CreateModel.toGenerate(
      originalInitializedModel.domainName,
      originalInitializedModel.domainPath,
      modelName,
      {
        fields: originalInitializedModel.original.fields,
        options: originalInitializedModel.original.options
      }
    )
  }

  async #modelWasUpdated(
    operations: ActionToGenerateType<any>[],
    modelName: string,
    stateInitializedModel: InitializedModelsType,
    originalInitializedModel: InitializedModelsType
  ) {
    const areModelsEqual = await originalInitializedModel.original._compareModels(stateInitializedModel.original);
    if (!areModelsEqual) {
      return actions.ChangeModel.toGenerate(
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
  }

  async #fieldWasCreated(fieldName: string, originalField: Field) {
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
   */
  async #reorderOperations(operations: ActionToGenerateType<any>[]) {
    const reorderedOperations = [];
    let pendingOperations = operations;
    let previousNumberOfReorderedOperations = -1;
    while (pendingOperations.length > 0) {
      let newPendingOperations = [];
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
        const didNotAddAnyPendingOperationInThePreviousRun = previousNumberOfReorderedOperations === reorderedOperations.length;
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

  async getMigrationFileContent(content: string, lastMigrationName: string ='') {
    const currentDate = new Date();
    const migrationName = `002_auto_migration_${currentDate.toString()}`
    const file = `/**\n * Automatically Generated by ${FRAMEWORK_NAME} at ${currentDate.toISOString()}\n */\n`+
    this.settings?.USE_TS ? `import { models, actions } from '${PACKAGE_NAME}'; \n\n` :
    `const { models, actions } = require('${PACKAGE_NAME}')\n\n`;
    this.settings?.USE_TS ? `export default {\n` : `module.exports = {\n` +
    `  name: '${migrationName}',\n  databases: ['default'],\n  dependsOn: '',\n` +
    `  operations: []\n};\n`;
  }

  async generateFiles(operations: ActionToGenerateType<any>[]) {
    for (const operation of operations) {

    }
  }

  async run() {
    const operations: ActionToGenerateType<any>[] = [];
    await this.#getOperationsFromModelsOrFields(
      this.#originalModelsByName, this.#stateModelsByName, 'model', operations
    );
    const didNotChangeAnythingInTheModels = operations.length === 0;
    if (didNotChangeAnythingInTheModels) {
      logging.logMessage(LOGGING_NO_CHANGES_MADE_FOR_MIGRATIONS);
    } else {
      const reorderedMigrations = await this.#reorderOperations(operations);
      console.log(reorderedMigrations);
    }
  }

  static async buildAndRun(
    settings: DatabaseSettingsType,
    migrations: FoundMigrationsFileType[],
    initializedEngineInstances: InitializedEngineInstancesType
  ) {
    const initializedEngineInstancesEntries = Object.entries(initializedEngineInstances);
    for (const [database, { engineInstance, projectModels }] of initializedEngineInstancesEntries) {
      const filteredMigrationsOfDatabase = migrations.filter(migration =>
        migration.migration.databases.includes(database)
      );
      const state = await State.buildState(filteredMigrationsOfDatabase);
      const initializedState = await state.initializeModels(engineInstance);
      const makemigrations = new this(settings, projectModels, initializedState);
      await makemigrations.run();
    }
  }
}
