import Engine from ".";
import { EngineFieldsType } from "./types";
import { Field, TranslatableField } from "../models/fields";

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

  /**
   * Sets the field instance in the `fields` Map object so we can retrieve it later. You generally don't need to override this.
   * This could be useful if you need to change the field instance itself or add a parameter to it.
   *
   * This method does not need to be override.
   *
   * @param field - The field instance to save on the map object.
   */
	async set(field: Field): Promise<void> {
		this.fields.set(field.fieldName, field);
	}

  /**
   * This should return the field translated, on here it returns if the field was translated and the field translated or not.
   *
   * We can create fields able to translate by itself (without needing to be defined on the engine). Those are `TranslatableField`s,
   * it is a field that have the `translate` function so we can translate it to a given engine at any time. Right now, it's not used
   * much, and might not be used by any existing engine, but it's a nice stuff to have for users. So if your engine does not support by
   * default all of the fields of the engine, the user can still create custom fields.
   *
   * Generally speaking this is more for the user to create custom fields for your engine. A better engine API will enable users to create
   * custom fields more easily.
   *
   * @param fieldName - The name of the field that we want to retrieve translated.
   *
   * @return - An object that explains if the field was already translated and the translated value of it.
   */
  async get(fieldName: string) {
    const field = this.fields.get(fieldName);
    const hasTranslateHandler = typeof (field as TranslatableField).translate === 'function';
    if (hasTranslateHandler) {
      const fieldAsTranslatable = (field as TranslatableField);
      return {
        wasTranslated: true,
        value: fieldAsTranslatable.translate ? fieldAsTranslatable.translate(this.engineInstance, this) : null
      };
    } else {
      return {
        wasTranslated: false,
        value: field
      };
    }
  }
}
