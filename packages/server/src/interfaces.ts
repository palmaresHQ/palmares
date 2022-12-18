import { Domain } from '@palmares/core';
import { Router } from './routers';

export type ServerDomainInterface = {
  getRoutes: () => Promise<Router>[] | Promise<{ default: Promise<Router>[] }>;
} & Domain;
