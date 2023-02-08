import Field from './field';
import { EngineFields } from '../../engine';

/**
 * Enables developers to create custom fields while also being able to translate them dynamically for a specific engine.
 * Engines might solve the most common issues but they might not support all fields out of the box so you use this field
 * to support the field you are looking to.
 */
export default class TranslatableField extends Field {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async translate(engineFields: EngineFields): Promise<any> {
    return undefined;
  }
}
