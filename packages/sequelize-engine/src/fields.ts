import { EngineFields, models } from "@palmares/core";

import SequelizeEngine from "./engine";

export default class SequelizeEngineFields extends EngineFields {
  engineInstance!: SequelizeEngine;
  
  constructor(engineInstance: SequelizeEngine) {
    super(engineInstance);
  }

  async set(field: models.fields.Field): Promise<void> {
    
  }
}