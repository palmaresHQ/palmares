import { createServerFn } from '@tanstack/react-start';
import { getHeaders } from 'vinxi/http';

import { isChromium } from '../utils/is-chromium';
import { getExamplesFiles, getLibraryCodes, getPalmaresFiles } from '../utils/get-library-codes';
import { getOriginFromHeaders } from '../utils/get-origin-from-headers';

export type GetLibraryCodesFn = typeof getLibraryCodes;
const isProduction = process.env?.NODE_ENV === 'production';

export const getAllLibraryCodes = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getHeaders();
  const origin = getOriginFromHeaders(headers as Record<string, string>);
  const host = origin || 'https://palmaresjs.com';

  if (isProduction) {
    const libraryCodesResponse = await fetch(`${host}/palmares-files.json`);
    const libraryCodes = await libraryCodesResponse.json();
    return libraryCodes;
  }
  const libraryCodes = await getPalmaresFiles({
    host,
    generateJson: false
  });
  return libraryCodes as any;
});

export const getExamples = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getHeaders();
  const origin = getOriginFromHeaders(headers as Record<string, string>);
  const host = origin || 'https://palmaresjs.com';

  if (isProduction) {
    const exampleFilesResponse = await fetch(`${host}/examples-files.json`);
    const exampleFiles = await exampleFilesResponse.json();

    return {
      isChromium: isChromium(getHeaders()),
      data: exampleFiles
    } as any;
  }
  const exampleFiles = await getExamplesFiles({
    host,
    generateJson: false
  });
  return {
    isChromium: isChromium(getHeaders()),
    data: exampleFiles
  } as any;
});
