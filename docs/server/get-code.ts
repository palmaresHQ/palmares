import { createServerFn } from '@tanstack/start';
import { getHeaders } from 'vinxi/http';

import { isChromium } from '../utils/is-chromium';
import { getExamplesFiles, getLibraryCodes, getPalmaresFiles } from '../utils/get-library-codes';

export type GetLibraryCodesFn = typeof getLibraryCodes;

export const getAllLibraryCodes = createServerFn({ method: 'GET' }).handler(async () => {
  const libraryCodes = await getPalmaresFiles();
  return libraryCodes as any;
});

export const getExamples = createServerFn({ method: 'GET' }).handler(async () => {
  const exampleFiles = await getExamplesFiles();
  return {
    isChromium: isChromium(getHeaders()),
    data: exampleFiles
  } as any;
});
