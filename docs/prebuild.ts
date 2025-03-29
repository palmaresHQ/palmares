import { getExamplesFiles, getPalmaresFiles } from './utils/get-library-codes';

await Promise.all([
  getExamplesFiles({ generateJson: true, host: undefined }),
  getPalmaresFiles({ generateJson: true, host: undefined })
]);
