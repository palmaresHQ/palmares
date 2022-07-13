import { Model } from '../../models'
import { MigrationFileType } from '../types';

export default class MakeMigrations {
  #models: Model[];
  #migrations: MigrationFileType[];

  constructor(models: Model[], migrations: MigrationFileType[]) {
    this.#models = models;
    this.#migrations = migrations;
  }

  async init() {

  }
}
