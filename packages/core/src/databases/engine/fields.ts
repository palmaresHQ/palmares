import Engine from ".";
import { EngineFieldsType } from "./types";
import { NotImplementedEngineFieldsException } from "./exceptions";
import { Field } from "../models/fields";

/**
 * This works as a storage and transformer for all of the fields. First we have the `set` method
 * that will store all of the fields in the object and then we have the `get` method that will return
 * the fields translated to a way that the ORM can understand.
 */
export default class EngineFields implements EngineFieldsType {
  engineInstance!: Engine;
  fields: Map<Field["fieldName"], Field> = new Map();

	constructor(engineInstance: Engine) {
		this.engineInstance = engineInstance;
	}

	async set(field: Field): Promise<void> {
		this.fields.set(field.fieldName, field);
	}
}