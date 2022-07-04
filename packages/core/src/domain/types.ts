export type DomainType = {
  name: string;
  path: string;

  ready?: () => Promise<void>;
  close?: () => Promise<void>;
  [key: string]: any;
}
