import Std from './interfaces';

/**
 * This class is used to store the default standard library.
 */
class StdConfiguration {
  defaultStandardLibrary: null | Std = null;

  setDefaultStd(std: typeof Std) {
    this.defaultStandardLibrary = new std();
  }

  get defaultStd() {
    if (this.defaultStandardLibrary === null) {
      throw new Error('Default standard library not set');
    }
    return this.defaultStandardLibrary;
  }
}

export default new StdConfiguration();
