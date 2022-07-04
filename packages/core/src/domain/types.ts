export type DomainType = {
  appName: string;
  appPath: string;
  
  ready?: () => Promise<void>;
  close?: () => Promise<void>;
  [key: string]: any;
}
