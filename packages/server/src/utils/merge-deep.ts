export function mergeDeep<TData extends any[]>(...objects: TData): TData[number] {
  const isObject = (object: any) => object && typeof object === 'object' && !Array.isArray(object);

  if (objects.length < 1) return {};
  if (objects.length === 1) return objects[0];

  const firstNonNullObj = objects.find((object) => object != null);
  const resultIsArray = Array.isArray(firstNonNullObj);

  const result = resultIsArray ? ([] as any) : ({} as any);

  for (const currentObject of objects) {
    if (currentObject == null) continue; // Skip null/undefined objects

    if (Array.isArray(currentObject)) {
      if (resultIsArray) {
        currentObject.forEach((item) => result.push(item));
      } else {
        currentObject.forEach((item, index) => {
          const existingValueAtIndex = result[index];
          const isDeepMergeNeeded = isObject(item) && isObject(existingValueAtIndex);

          if (isDeepMergeNeeded) result[index] = mergeDeep(existingValueAtIndex, item);
          else result[index] = item;
        });
      }
    } else if (isObject(currentObject)) {
      Object.keys(currentObject).forEach((key) => {
        const existingValue = result[key];
        const newValue = currentObject[key];
        const areBothObjects = isObject(existingValue) && isObject(newValue);
        const areBothArrays = Array.isArray(existingValue) && Array.isArray(newValue);

        if (areBothObjects || areBothArrays) result[key] = mergeDeep(existingValue, newValue);
        else result[key] = newValue;
      });
    }
  }

  return result;
}
