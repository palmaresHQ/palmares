export class ModelCircularAbstractError extends Error {
	constructor(originalModelName: string, abstractModelName: string) {
		super(`Model ${originalModelName} have a circular abstract dependency with ${abstractModelName}`);
	}
}

export class ModelInvalidAbstractFieldError extends Error {
	constructor(modelName: string, abstractModelName: string, fieldName: string) {
		super(`The abstract model ${abstractModelName} already have a field named ${fieldName}, `+
		`please rename the field ${fieldName} in the ${modelName} model`);
	}
}

export class ModelInvalidAbstractManagerError extends Error {
	constructor(modelName: string, abstractModelName: string, managerName: string) {
		super(`The abstract model ${abstractModelName} already have a manager named ${managerName}, `+
		`please rename the field ${managerName} in the ${modelName} model`);
    this.name = ModelInvalidAbstractManagerError.name;
	}
}

export class ManagerEngineInstanceNotFoundError extends Error {
  constructor(engineName: string) {
    super(`The engine ${engineName} is not found in the manager. Make sure that this model is available for that engine.`);
    this.name = ManagerEngineInstanceNotFoundError.name;
  }
}
