import { domain } from '@palmares/core';

export default domain('core', __dirname, {
  commands: {
    seedDb: {
      description: 'Seed the database with some data. Used for testing.',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: async () => {
        console.log('Seeding the database...');
        // Do something else
      },
    },
  },
});
