import DatabaseAdapter from '../engine';

/**
 * This is the default function when we want to duplicate the engine.
 *
 * It will receive an engine and it will return a callback function that should be called inside of the {@link DatabaseAdapter.duplicate} function. This is the default behavior of the
 * duplicate function.
 *
 * @param engine - The engine that we want to duplicate.
 *
 * @returns - The default duplicate function that should be called inside {@link DatabaseAdapter.duplicate}.
 */
export function defaultEngineDuplicate(engine: DatabaseAdapter, wasCalled = { value: false }) {
  return async () => {
    const engineConstructor = engine.constructor as typeof DatabaseAdapter;
    const [argsForNewInstance, newInstance] = await engineConstructor.new(engine.__argumentsUsed);
    newInstance.__argumentsUsed = argsForNewInstance;
    newInstance.initializedModels = { ...engine.initializedModels };
    newInstance.__modelsOfEngine = { ...engine.__modelsOfEngine };
    newInstance.__modelsFilteredOutOfEngine = {
      ...engine.__modelsFilteredOutOfEngine,
    };
    newInstance.__indirectlyRelatedModels = {
      ...engine.__indirectlyRelatedModels,
    };
    wasCalled.value = true;
    return newInstance;
  };
}
