export { initializeApp } from './app/utils';

export * as Commands from './commands';
export * from './commands/types';
export { Domain, domain } from './domain';
export { initializeDomains, retrieveDomains } from './domain/utils';
export * from './domain/types';
export { defineSettings } from './conf';
export { getSettings, setSettings } from './conf/settings';
export * from './conf/types';
export * as utils from './utils';
export {
  ERR_MODULE_NOT_FOUND,
  FRAMEWORK_NAME,
  PACKAGE_NAME,
  PALMARES_SETTINGS_MODULE_ENVIRONMENT_VARIABLE
} from './utils/constants';
export { imports } from './utils';
export * from './utils/types';

export { AppServer, appServer } from './app';
export type { AppServerInterface } from './app/types';
export { ImportsError, getDefaultStd, setDefaultStd } from './std';
export { Std, type Asker, type ChildProcess, type FilesAndFolders, type Os } from './std-adapter';

export { coreDomain as CoreDomain } from './domain/default';
export { coreDomain as default } from './domain/default';
