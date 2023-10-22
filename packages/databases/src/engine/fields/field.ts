import { EngineDoesNotSupportFieldTypeException } from '../../models/exceptions';

import { Field } from '../../models/fields';
import type Engine from '..';
import { model } from '../../models';

/**
 * This will be used to parse the fields that are going to be used in the model in the database, for every field we will call this class.
 * This class will have two methods:
 * - `internalParse` - That will be called internally and should not be overridden.
 * - `translate` - Used to translate the field to something that the database can understand. Except for the `TranslatableField` class that will be
 * translated directly with the `translate` method, all other field types should define a parser with the `translate` field, those will be injected
 * in the `Engine` class constructor.
 */
export default class EngineFieldParser {
  async translate(args: {
    engine: Engine;
    field: ConstructorParameters<typeof Field>[0];
    fieldParser: EngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof model>>;
    lazyEvaluate: (translatedField: any) => void;
  }): Promise<any> {
    throw new EngineDoesNotSupportFieldTypeException(args.engine.constructor.name, Field.name);
  }

  async inputParser?(args: {
    engine: Engine;
    field: ConstructorParameters<typeof Field>[0];
    fieldParser: EngineFieldParser;
    modelName: string;
    model: InstanceType<ReturnType<typeof model>>;
    value: any;
  }) {}
}
