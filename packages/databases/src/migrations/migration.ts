import Engine from "../engine";
import { Operation } from "./actions";

export default class Migration {
  dependency!: string;
  engineInstance!: Engine;
  operations: Operation[] = [];

  transaction: any = undefined;

  static async buildFromFile() {

  }
}
