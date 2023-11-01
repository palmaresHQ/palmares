/**
 * Because some runtime environments doesn't support the File {@see https://developer.mozilla.org/en-US/docs/Web/API/File/File} object we create a File-like constructor.
 * This is just a simple class that also holds the name of the file.
 */
export class FileLike {
  blob: Blob;
  name: string;

  constructor(blob: Blob, name: string) {
    this.blob = blob;
    this.name = name;
  }
}

// Reference: https://stackoverflow.com/a/24901386
export const GeneratorFunction = function* () {
  yield undefined;
}.constructor;
export const AsyncGeneratorFunction = async function* () {
  yield undefined;
}.constructor;
