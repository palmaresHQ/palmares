import { ManagerInstancesType, ManagerEngineInstancesType } from "./types";
import { ManagerEngineInstanceNotFoundError } from "./exceptions";
import Engine from "../engine";
import Model from "./model";

export default class Manager<EI extends Engine | null = null> {
  instances: ManagerInstancesType;
  engineInstances: ManagerEngineInstancesType;
  defaultEngineInstanceName: string;

  constructor() {
    this.instances = {};
    this.engineInstances = {};
    this.defaultEngineInstanceName = '';
  }

  getInstance<T extends Engine = Engine>(engineName?: string): EI extends Engine ? EI["ModelType"] : T["ModelType"] {
    let engineInstanceName: string = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = this.instances[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.instances[engineInstanceName];

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setInstance(engineName: string, instance: any) {
    const isDefaultEngineInstanceNameEmpty = this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.defaultEngineInstanceName = engineName;

    this.instances[engineName] = instance;
  }

  getEngineInstance<T extends Engine = Engine>(engineName?: string): EI extends Engine ? EI : T {
    let engineInstanceName: string = engineName || this.defaultEngineInstanceName;
    const doesInstanceExists = this.engineInstances[engineInstanceName] !== undefined;
    if (doesInstanceExists) return this.engineInstances[engineInstanceName];

    throw new ManagerEngineInstanceNotFoundError(engineInstanceName);
  }

  _setEngineInstance(engineName: string, instance: Engine) {
    const isDefaultEngineInstanceNameEmpty = this.defaultEngineInstanceName === '';
    if (isDefaultEngineInstanceNameEmpty) this.defaultEngineInstanceName = engineName;
    this.engineInstances[engineName] = instance;
  }
}

export class DefaultManager extends Manager<null> {}
