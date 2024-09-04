import initializeClient from '@palmares/client';

import type { coreDomain, inventoryDomain } from './core';
import type settings from './settings';
import type palmaresCoreDomain from '@palmares/core';
import type serverDomain from '@palmares/server';

const pFetch = initializeClient<[typeof coreDomain, typeof inventoryDomain]>('http://localhost:3001');

const main = async () => {
  const response = await pFetch('/aqui', {
    method: 'GET'
  });

  const data = await response.json();
};

main();
