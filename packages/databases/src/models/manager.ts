import {
  ManagerInstancesType,
  ManagerEngineInstancesType,
  AllOptionalModelFields,
  AllRequiredModelFields,
  TModel
} from "./types";
import { ManagerEngineInstanceNotFoundError } from "./exceptions";
import Engine from "../engine";
import { Model, default as model } from "./model";

export type ClassConstructor<T> = {
  new (...args: unknown[]): T;
};

export default class Manager<M extends Model = Model, EI extends Engine | null = null> {
  instances: ManagerInstancesType;
  engineInstances: ManagerEngineInstancesType;
  defaultEngineInstanceName: string;
  model!: ReturnType<typeof model<M>>;

  constructor() {
    this.instances = {};
    this.engineInstances = {};
    this.defaultEngineInstanceName = '';
  }

  _setModel(model: M) {
    this.model = model as any;
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

  async get(search?: AllOptionalModelFields<M>, engineName?: string): Promise<AllRequiredModelFields<M>[] | null> {
    return this.getEngineInstance().query.get<M>(this.getInstance(engineName), search);
  }
}

export class DefaultManager<M extends Model> extends Manager<M, null> {}
