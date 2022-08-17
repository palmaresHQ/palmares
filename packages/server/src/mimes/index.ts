import other from "./other";
import standard from "./standard";

/**
 * This class is inspired by this library: https://github.com/broofa/mime
 * This library is used by express to retrieve the mime type more easily.
 *
 * Since it's a really small library we added directly to the code here (remember that we do not need to have
 * any external dependencies in our framework to work with multiple environments and runtime).
 *
 * What this does is define a simple text for each of the mime types. for example, instead of needing to
 * define `application/json` you just need to define `json`. Instead of `plain/text` you just need to
 * define `text`.
 *
 * For custom and specific mime types, you need to define them in the headers directly.
 *
 * This takes a long time to load so we cache the class in memory after it is loaded, so we load it as a
 * singleton.
 */
export default class Mimes {
  formattedMimes: any = {};
  static __instance: undefined | Mimes;

  async getMime(type: string) {
    const selectedMime = this.formattedMimes[type];
    if (selectedMime) return selectedMime;
    return null;
  }

  /**
   * This is how you will get the instance for the mimes class. This class is a singleton, so we will
   * save the instance inside of the class in it's static property called __instance.
   *
   * When we want to get the instance again we will check if the instance for this class was already defined.
   * If it was, then we will return it, otherwise we will create a new instance and save it so we are able to
   * use it later.
   *
   * @returns - The saved instance of the mimes class.
   */
  static async new(): Promise<Mimes> {
    const anInstanceAlreadyExists = this.__instance !== undefined;
    if (!anInstanceAlreadyExists) {
      const mimeInstance = new this();
      const entriesForOther = Object.entries(other);
      const entriesForStandard = Object.entries(standard);
      for (const [otherKey, otherValues] of entriesForOther) {
        for (const otherValue of otherValues) {
          mimeInstance.formattedMimes[otherValue] = otherKey;
        }
      }

      for (const [standardKey, standardValues] of entriesForStandard) {
        for (const standardValue of standardValues) {
          mimeInstance.formattedMimes[standardValue] = standardKey;
        }
      }
      this.__instance = mimeInstance;
    }
    return this.__instance as Mimes;
  }
}
