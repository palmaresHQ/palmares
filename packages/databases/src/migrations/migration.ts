import Engine from "../engine";
import { Operation } from "./actions";

export default class Migration {
  dependsOn!: string;
  engineInstance!: Engine;
  operations: Operation[] = [];

  transaction: any = undefined;

  static async buildFromFile() {

  }
}
