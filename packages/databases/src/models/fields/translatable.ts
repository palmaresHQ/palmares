import { Field } from './field';

import type { DatabaseAdapter } from '../../engine';

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
export class TranslatableField extends Field {
  typeName: string = TranslatableField.name;
  translate!: () => Promise<any>;
  customToString?: () => Promise<{ imports: string[]; translateBody: string }>;

  constructor(params: {
    translate: () => Promise<any>;
    customAttributes?: any;
    customToString?: () => Promise<{ imports: string[]; translateBody: string }>;
  }) {
    super({ customAttributes: params.customAttributes } as any);
    this.translate = params.translate.bind(this);
    if (params.customToString) this.customToString = params.customToString.bind(this);
  }

  static new(params: {
    translate: () => Promise<any>;
    customToString?: () => Promise<{
      imports: string[];
      translateBody: string;
    }>;
    customAttributes?: any;
  }): Field<any, any, any, any, any, any, any, any> {
    return new this({
      customAttributes: params.customAttributes,
      customToString: params.customToString,
      translate: params.translate
    } as any);
  }

  async toString(indentation?: number, _customParams?: string | undefined): Promise<string> {
    const ident = '  '.repeat((indentation || 0) + 1);

    if (typeof this.customToString !== 'function') throw new Error('toString should be implemented');

    const translateBody = await (this.customToString as any)?.();
    const fieldParamsIdent = '  '.repeat((indentation || 0) + 2);
    return (
      `models.fields.${this.constructor.name}.new({\n` +
      `${ident}translate: async () => {\n` +
      `${fieldParamsIdent}${translateBody.imports.join('\n')}\n` +
      `${fieldParamsIdent}${translateBody.translateBody}\n` +
      `${ident}}\n` +
      `${'  '.repeat(indentation || 0)}})
      `
    );
  }

  async compare(field: Field): Promise<[boolean, string[]]> {
    const fieldAsTranslatable = field as unknown as TranslatableField;
    const [newString, oldString] = await Promise.all([this.toString(), fieldAsTranslatable.toString()]);
    const isTranslateEqual = JSON.stringify(newString) === JSON.stringify(oldString);
    const [isEqual, changedAttributes] = await super.compare(field);

    if (!isTranslateEqual) changedAttributes.push('translate');

    return [isTranslateEqual && isEqual, changedAttributes];
  }
}
