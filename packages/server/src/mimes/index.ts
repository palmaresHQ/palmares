import other from "./other";
import standard from "./standard";

class Mimes {
  formattedMimes: any = {};

  async getMime(type: string) {
    const selectedMime = this.formattedMimes[type];
    if (selectedMime) return selectedMime;
    return null;
  }

  static async new() {
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
    return mimeInstance;
  }
}

export default Mimes.new();
