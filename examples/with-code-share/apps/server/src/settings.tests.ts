import { dirname, resolve } from 'node:path';
import settings from './settings';
import JestTestAdapter from '@palmares/jest-tests';
import TestsDomain from '@palmares/tests';

settings.basePath = dirname(resolve(__dirname));
settings.settingsLocation = __filename;
(settings.installedDomains as unknown as any[]).push([
  TestsDomain,
  {
    testAdapter: JestTestAdapter,
  }
]);

export default settings;