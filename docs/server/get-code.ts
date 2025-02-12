import { createServerFn } from '@tanstack/start';
import { getHeaders } from 'vinxi/http';

import { isChromium } from '../utils/is-chromium';
import { getExamplesFiles, getLibraryCodes, getPalmaresFiles } from '../utils/get-library-codes';

export type GetLibraryCodesFn = typeof getLibraryCodes;
const isProduction = process.env?.NODE_ENV === 'production';

export const getAllLibraryCodes = createServerFn({ method: 'GET' }).handler(async () => {
  if (isProduction) {
    const libraryCodesResponse = await fetch('/palmares-files.json');
    const libraryCodes = await libraryCodesResponse.json();
    return libraryCodes;
  }
  const libraryCodes = await getPalmaresFiles();
  return libraryCodes as any;
});

export const getExamples = createServerFn({ method: 'GET' }).handler(async () => {
  if (isProduction) {
    const exampleFilesResponse = await fetch('/examples-files.json');
    const exampleFiles = await exampleFilesResponse.json();

    return {
      isChromium: isChromium(getHeaders()),
      data: exampleFiles
    } as any;
  }
  const exampleFiles = await getExamplesFiles();
  return {
    isChromium: isChromium(getHeaders()),
    data: exampleFiles
  } as any;
});
