import { Response, pathNested, HTTP_200_OK, HTTP_404_NOT_FOUND } from '@palmares/server';
import { ModelFields } from '@palmares/databases';

import type { bestClientsRouter, bestProfessionRouter } from './routes';
import { getBestClients, getBestProfession } from './services';
import { Profile } from '../auth/models';

export const bestProfessionController = pathNested<typeof bestProfessionRouter>()().get(async (request) => {
  const { start, end } = request.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const profession = await getBestProfession(startDate, endDate);
  if (!profession)
    return Response.text('We have not found anyone that worked during this timestamp', { status: HTTP_404_NOT_FOUND });
  return Response.json(
    {
      data: profession,
    },
    { status: HTTP_200_OK }
  );
});

export const bestClientsController = pathNested<typeof bestClientsRouter>()().get(async (request) => {
  const { start, end } = request.query;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const bestClients = await getBestClients(startDate, endDate, request.query.limit as number | undefined);
  const formattedBestClients = bestClients.map(
    (client: ModelFields<Profile>): ModelFields<Profile> => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      profession: client.profession,
      balance: client.balance,
      type: client.type,
    })
  );
  return Response.json(
    {
      data: formattedBestClients,
    },
    { status: HTTP_200_OK }
  );
});
