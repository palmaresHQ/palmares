/**
 * If the runtime environment does not support FormData, this function should be used to create a form data like object.
 *
 * If you don't specify a FormDataLike class, a default FormDataLike class will be created.
 */
export function formDataLikeFactory(
  formDataLike?: new () => {
    append: (name: string, value: string | Blob | Buffer, fileName?: string) => void;
    get: (name: string) => string | Blob | Buffer | null;
    getAll: (name: string) => Array<string | Blob | Buffer | null>;
    has: (name: string) => boolean;
    set: (name: string, value: string | Blob | Buffer, fileName?: string) => void;
    delete: (name: string) => void;
  }
) {
  if (formDataLike) return formDataLike;
  else
    return class FormDataLike {
      data = new Map<string, { value: string | Blob | Buffer; filename?: string }[]>();

      append(name: string, value: string | Blob | Buffer, fileName?: string) {
        const existingDataOfName = this.data.get(name);
        if (existingDataOfName) existingDataOfName.push({ value, filename: fileName });
        else this.data.set(name, [{ value, filename: fileName }]);
      }

      get(name: string) {
        const existingDataOfName = this.data.get(name);

        if (existingDataOfName) return existingDataOfName?.[0]?.value || null;
        else return null;
      }

      getAll(name: string) {
        const existingDataOfName = this.data.get(name);

        if (existingDataOfName) return existingDataOfName.map((item: any) => item.value);
        else return [];
      }

      has(name: string) {
        return this.data.has(name);
      }

      set(name: string, value: string | Blob, fileName?: string) {
        this.data.set(name, [{ value, filename: fileName }]);
      }

      delete(name: string) {
        this.data.delete(name);
      }
    };
}
