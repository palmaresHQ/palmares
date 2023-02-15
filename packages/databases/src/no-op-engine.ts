import Engine, {
  EngineAutoFieldParser,
  EngineBigAutoFieldParser,
  EngineBigIntegerFieldParser,
  EngineCharFieldParser,
  EngineDateFieldParser,
  EngineDecimalFieldParser,
  EngineFieldParser,
  EngineFields,
  EngineForeignKeyFieldParser,
  EngineGetQuery,
  EngineIntegerFieldParser,
  EngineMigrations,
  EngineModels,
  EngineQuery,
  EngineQueryOrdering,
  EngineQuerySearch,
  EngineRemoveQuery,
  EngineSetQuery,
  EngineTextFieldParser,
  EngineUuidFieldParser,
} from './engine';
import { DatabaseConfigurationType } from './types';

/**
 * This is a dummy engine that does nothing, it is supposed to be used for when you want to use palmares without a database connection
 * but primarily connecting multiple databases together.
 */
export default class NoOpEngine extends Engine {
  _ignoreNotImplementedErrors = true;

  constructor(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<any, any>
  ) {
    super(
      databaseName,
      databaseSettings,
      {
        fields: EngineFields,
        field: EngineFieldParser,
        auto: EngineAutoFieldParser,
        bigAuto: EngineBigAutoFieldParser,
        bigInteger: EngineBigIntegerFieldParser,
        char: EngineCharFieldParser,
        date: EngineDateFieldParser,
        decimal: EngineDecimalFieldParser,
        foreignKey: EngineForeignKeyFieldParser,
        integer: EngineIntegerFieldParser,
        text: EngineTextFieldParser,
        uuid: EngineUuidFieldParser,
      },
      {
        query: EngineQuery,
        get: EngineGetQuery,
        set: EngineSetQuery,
        remove: EngineRemoveQuery,
        search: EngineQuerySearch,
        ordering: EngineQueryOrdering,
      },
      EngineModels,
      EngineMigrations
    );
  }

  static async new(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<string, object>
  ): Promise<Engine> {
    return new this(databaseName, databaseSettings);
  }

  async isConnected() {
    return true;
  }
}
