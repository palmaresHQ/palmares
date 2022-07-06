import { ManagerInstancesType, ManagerEngineInstancesType } from "./types";
import { ManagerEngineInstanceNotFoundError } from "./exceptions";
import Engine from "../engine";

export default class Manager<EI extends Engine = any> {
  instances: ManagerInstancesType;
  engineInstances: ManagerEngineInstancesType;
  defaultEngineInstanceName: string;

  constructor() {
    this.instances = {};
    this.engineInstances = {};
    this.defaultEngineInstanceName = '';
  }

  getInstance<T extends Engine = any>(engineName?: string): T["ModelType"] {
    let engineInstanceName: string = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = this.instances[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.instances[engineInstanceName];

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  setInstance(engineName: string, instance: any) {
    const isDefaultEngineInstanceNameEmpty = this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.defaultEngineInstanceName = engineName;
    this.instances[engineName] = instance;
  }
}

export class DefaultManager<T extends Engine = any> extends Manager<T> {}
