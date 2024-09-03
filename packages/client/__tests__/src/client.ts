import initializeClient from '@palmares/client';

import type { coreDomain, inventoryDomain } from './core';
import type settings from './settings';
import type palmaresCoreDomain from '@palmares/core';
import type serverDomain from '@palmares/server';

const pFetch = initializeClient<[typeof coreDomain, typeof inventoryDomain]>('http://localhost:3001');

const main = async () => {
  const response = await pFetch('/here/hello/<id: number>?name=string?', {
    method: 'GET',
    params: {
      id: 1
    },
    query: {
      name: 'John'
    }
  });

  const data = await response.json();
};

main();
