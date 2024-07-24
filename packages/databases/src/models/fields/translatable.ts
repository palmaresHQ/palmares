import Field from './field';

import type DatabaseAdapter from '../../engine';

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
 *    async translate(engine: DatabaseAdapter): Promise<ModelAttributeColumnOptions> {
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
  translate!: (engine: DatabaseAdapter) => Promise<any>;

  constructor(params: { translate: (engine: DatabaseAdapter) => Promise<any>; customAttributes?: any }) {
    super({ customAttributes: params.customAttributes } as any);
    this.translate = params.translate.bind(this);
  }

  static new(params: {
    translate: (engine: DatabaseAdapter) => Promise<any>;
    customAttributes?: any;
  }): Field<any, any, any, any, any, any, any, any> {
    return new this({ customAttributes: params.customAttributes } as any);
  }
}
