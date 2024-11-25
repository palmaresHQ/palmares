// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { setDatabaseConfig } from '@palmares/databases';
import { NodeStd } from '@palmares/node-std';
import { SequelizeEngine } from '@palmares/sequelize-engine';

import * as migrations from './migrations';
import { Company, User } from './src/models';

// SQLITE database
const engine = SequelizeEngine.new({
  dialect: 'sqlite',
  storage: './sequelize.sqlite3'
});

// POSTGRES database
/**
const engine = SequelizeEngine.new({
  url: 'postgres://user:pass@dbhost.com:5432/dbname'
});
*/

const std = new NodeStd();

export default setDatabaseConfig({
  databases: {
    default: { engine }
  },
  locations: [
    {
      name: 'default',
      // dirname and fileURLToPath is just for compatibility with older versions of Node.js
      // Remove if you are using Node.js 20.0.0 or higher
      path: import.meta.dirname || std.files.dirname(std.files.getFileURLToPath(import.meta.url)),
      getMigrations: () => migrations,
      getModels: () => [Company, User]
    }
  ],
  std
});
