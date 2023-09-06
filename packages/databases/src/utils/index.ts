import { CustomImportsForFieldType } from '../models/fields/types';

export * from './constants';
export { default as hashString } from './hash';
export * from './models';

/** Retrieves the unique custom imports of the field or the model to generate the migrations to. */
export function getUniqueCustomImports(
  customImports: CustomImportsForFieldType[],
  customImportsToAppendDataTo: CustomImportsForFieldType[] = []
) {
  for (const customImport of customImports) {
    const doesNotExistYet =
      customImportsToAppendDataTo.find(
        (alreadyExistingCustom) =>
          alreadyExistingCustom.packageName === customImport.packageName &&
          alreadyExistingCustom.value === customImport.value
      ) === undefined;
    if (doesNotExistYet) customImportsToAppendDataTo.push(customImport);
  }
  return customImportsToAppendDataTo;
}

// Reference: https://stackoverflow.com/a/8809472
export function generateUUID() {
  let date = new Date().getTime(); //Timestamp
  import('perf_hooks');
  const performance = (globalThis as any).performance as typeof import('perf_hooks')['performance'];
  let performanceDate = (performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    let randomNumber = Math.random() * 16; //random number between 0 and 16
    if (date > 0) {
      //Use timestamp until depleted
      randomNumber = (date + randomNumber) % 16 | 0;
      date = Math.floor(date / 16);
    } else {
      //Use microseconds since page-load if supported
      randomNumber = (performanceDate + randomNumber) % 16 | 0;
      performanceDate = Math.floor(performanceDate / 16);
    }
    return (character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8).toString(16);
  });
}
