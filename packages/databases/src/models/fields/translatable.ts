import Field from './field';
import Engine from '../../engine';

/**
 * Enables developers to create custom fields while also being able to translate them dynamically for a specific engine.
 * Engines might solve the most common issues but they might not support all fields out of the box so you use this field
 * to support the field you are looking to.
 *
 * This should be documented by the engine that you are using, how they expect you to return the data.
 *
 * @example
 * ```ts
 * import { TranslatableField } from '@palmares/database';
 * import { ModelAttributeColumnOptions } from 'sequelize';
 *
 * class MyCustomField extends TranslatableField {
 *    typeName: string = 'MyCustomField';
 *
 *    async translate(engine: Engine): Promise<ModelAttributeColumnOptions> {
 *       return {
 *         type: engine.DataTypes.STRING,
 *        allowNull: false,
 *       };
 *    }
 * }
 * ```
 */
export default class TranslatableField extends Field {
  typeName: string = TranslatableField.name;

  async translate(_engine: Engine): Promise<any> {
    return undefined;
  }
}
