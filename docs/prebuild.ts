import { getExamplesFiles, getPalmaresFiles } from './utils/get-library-codes';

await Promise.all([getExamplesFiles({ generateJson: true }), getPalmaresFiles({ generateJson: true })]);
