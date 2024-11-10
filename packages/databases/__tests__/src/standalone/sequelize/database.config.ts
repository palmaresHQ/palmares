import { setDatabaseConfig } from '@palmares/databases';
import { NodeStd } from '@palmares/node-std';
import { SequelizeEngine } from '@palmares/sequelize-engine';
import * as migrations from './migrations';

import { Company, User } from './models';

export default setDatabaseConfig({
  databases: {
    default: {
      engine: SequelizeEngine.new({
        dialect: 'sqlite',
        storage: './standalone.sequelize.db',
      }),
    },
  },
  locations: [
    {
      name: 'default',
      path: import.meta.dirname,
      getMigrations: () => migrations,
      getModels: () => [User, Company],
    },
  ],
  std: new NodeStd(),
});
