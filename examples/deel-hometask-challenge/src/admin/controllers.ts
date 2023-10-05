import { Response, pathNested, HTTP_200_OK, HTTP_404_NOT_FOUND } from '@palmares/server';

import type { bestClientsRouter, bestProfessionRouter } from './routes';
import { getBestClients, getBestProfession } from './services';

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
  const formattedBestClients = bestClients.map((client): { id: number; fullName: string; paid: number } => ({
    id: client.id,
    fullName: `${client.firstName} ${client.lastName}`,
    paid: client.paid,
  }));
  return Response.json(
    {
      data: formattedBestClients,
    },
    { status: HTTP_200_OK }
  );
});
