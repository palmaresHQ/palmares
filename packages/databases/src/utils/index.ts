import { CustomImportsForFieldType } from '../models/fields/types';

export * from './constants';

/** Retrieves the unique custom imports of the field or the model to generate the migrations to. */
export function getUniqueCustomImports(
  customImports: CustomImportsForFieldType[],
  customImportsToAppendDataTo: CustomImportsForFieldType[] = []
) {
  for (const customImport of customImports) {
    const doesNotExistYet = customImportsToAppendDataTo.find(alreadyExistingCustom =>
      alreadyExistingCustom.packageName === customImport.packageName &&
      alreadyExistingCustom.value === customImport.value
    ) === undefined;
    if (doesNotExistYet) customImportsToAppendDataTo.push(customImport);
  }
  return customImportsToAppendDataTo;
}
