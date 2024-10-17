import { auto, char, define, setDatabaseConfig } from '@palmares/databases';
import { NodeStd } from '@palmares/node-std';
import { SequelizeEngine } from '@palmares/sequelize-engine';

// DEFINE SEUS MODELS
export const ProfileType = define('ProfileType', {
  fields: {
    id: auto(),
    name: char({ maxLen: 255 })
  },
  options: {
    tableName: 'profile_type'
  }
});

// DEFINE A CONEXÃO E OS MODELS
setDatabaseConfig({
  databases: {
    default: {
      engine: SequelizeEngine.new({
        dialect: 'sqlite',
        storage: './sequelize.sqlite3'
      })
    }
  },
  locations: [
    {
      name: 'default',
      path: import.meta.dirname,
      getMigrations: () => [],
      getModels: () => [ProfileType]
    }
  ],
  std: new NodeStd()
});

// USA ELES NO MEIO DA APLICAÇÃO
const main = async () => {
  const allData = await ProfileType.default.get((qs) => qs);
  console.log(allData);
};

main();
