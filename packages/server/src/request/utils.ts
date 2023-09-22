import { BaseRouter } from '../router/routers';

export function parseParamsValue(
  value: any,
  type:
    | (BaseRouter['__queryParamsAndPath']['params'] extends Map<any, infer TType> ? TType : any)
    | (BaseRouter['__urlParamsAndPath']['params'] extends Map<any, infer TType> ? TType : any)
) {
  if (type.type.includes('string') && typeof value === 'string') return value;
  else if (type.type.includes('string') && typeof value !== 'string') {
    if (value !== undefined && value !== null) return String(value);
    else return undefined;
  } else if (type.type.includes('number') && typeof value === 'number') return value;
  else if (type.type.includes('number') && typeof value !== 'number') {
    const numberValidatorRegex = /^[\d]+((\.{1})?[\d]+)?$/g;
    if (value !== undefined && value !== null && numberValidatorRegex.test(value.toString())) return Number(value);
    else return undefined;
  } else if (type.type.includes('boolean') && typeof value === 'boolean') return value;
  else if (type.type.includes('boolean') && typeof value !== 'boolean') return Boolean(value);
  return undefined;
}

export function parseQueryParams(
  value: any,
  type: BaseRouter['__queryParamsAndPath']['params'] extends Map<any, infer TType> ? TType : any
) {
  if (type.isArray && Array.isArray(value)) return value.map((valueToParse) => parseParamsValue(valueToParse, type));
  else return parseParamsValue(value, type);
}

/**
 * Since not all runtime environments support FormData, this function should be used to create a form data like object.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/FormData for more information.
 *
 * @returns - A class that can be used to create a new FormData-like instance. This FormData-like instance behave the same way as the original FormData class.
 */
export function formDataLikeFactory() {
  return class FormDataLike {
    proxyCallback: ConstructorParameters<typeof FormDataLike>[0];
    data: Record<string, { value: string | Blob | File; fileName?: string }[]>;

    /**
     * Instead of the default FormData constructor, this one will create a FormData-like object. You can pass a proxyCallback to it,
     * this way you can lazy load the values of the form data.
     *
     * @param proxyCallback - A callback that will be called when a value is needed. This way you can lazy load the values of the form data.
     */
    constructor(
      /**
       * This should be prefered, what it does is that instead of creating a default form data like class it'll return a proxy, this way all values are lazy loaded. Just when needed.
       */
      proxyCallback?: {
        /**
         * This function will be called when a value is needed. It should return an array of object for the given key.
         *
         * If the key is a File or Blob, fileName should be defined. Otherwise just return on value. A File object is prefered over a Blob object, because it can hold more information
         * about the file.
         *
         * @example
         * ```ts
         * const formData = new FormDataLike({
         *   getValue: (name) => {
         *      if (name === 'file') return [{ value: new File([''], 'file.txt'), fileName: 'file.txt' }];
         *      else return [{ value: 'value' }];
         *   },
         * });
         * formData.get('file'); // File { name: 'file.txt' }
         * ```
         *
         * @param name - The name of the key to get the value from.
         */
        getValue: (name: string) => {
          value: string | Blob | File;
          fileName?: string;
        }[];
        /**
         * This function will be called for returning all keys of the form data in order to transform it to a json object.
         *
         * @example
         * ```ts
         * const formData = new FormDataLike({
         *   getValue: (name) => {
         *     if (name === 'file') return [{ value: new File([''], 'file.txt'), fileName: 'file.txt' }];
         *     else return [{ value: 'value' }];
         *   },
         *   getKeys: () => ['file', 'key'],
         * });
         *
         * formData.toJSON(); // { file: File { name: 'file.txt' }, key: 'value' }
         * ```
         *
         * @returns - An array of all keys of the form data.
         */
        getKeys: () => string[];
      }
    ) {
      this.proxyCallback = proxyCallback;
      this.data = proxyCallback
        ? new Proxy({} as Record<string, { value: string | Blob | File; fileName?: string }[]>, {
            get: (target, name) => {
              if (name in target) return target[name as string];
              else {
                const values = proxyCallback.getValue?.(name as string);
                if (!values) return undefined;
                for (const value of values || []) {
                  if (value) {
                    if (target[name as string]) target[name as string].push(value);
                    else target[name as string] = [value];
                  }
                }
                return target[name as string];
              }
            },
            set: (target, name, value: { value: string | Blob | File; fileName?: string }[]) => {
              target[name as string] = value;
              return true;
            },
            deleteProperty: (target, name) => {
              delete target[name as string];
              return true;
            },
            has: (target, name) => {
              return name in target;
            },
          })
        : ({} as Record<string, { value: string | Blob; fileName?: string }[]>);
    }

    append(name: string, value: string | Blob | File, fileName?: string) {
      const existingDataOfName = this.data[name];
      if (existingDataOfName) existingDataOfName.push({ value, fileName: fileName });
      else this.data[name] = [{ value, fileName: fileName }];
    }

    get(name: string) {
      const existingDataOfName = this.data[name];

      if (existingDataOfName) return existingDataOfName?.[0]?.value || null;
      else return null;
    }

    getAll(name: string) {
      const existingDataOfName = this.data[name];
      if (existingDataOfName) return existingDataOfName.map((item: any) => item.value);
      else return [];
    }

    has(name: string) {
      return name in this.data;
    }

    set(name: string, value: string | Blob | File, fileName?: string) {
      this.data[name] = [{ value, fileName: fileName }];
    }

    delete(name: string) {
      delete this.data[name];
    }

    /**
     * Converts the form data like object to a json object, this way it can be validated by schemas or anything else.
     *
     * Important: Be aware that this function will only return the first value of each key, if you want to get all values of a key use getAll instead.
     */
    toJSON() {
      const allKeys = this.proxyCallback?.getKeys?.() || Object.keys(this.data);
      const result: Record<string, string | Blob | File> = {};
      for (const key of allKeys) {
        const values = this.getAll(key);
        if (values.length > 1) (result as any)[key] = values;
        else if (values.length === 1) (result as any)[key] = values[0];
      }
      return result;
    }
  };
}
