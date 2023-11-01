import { Response, pathNested } from '@palmares/server';

import type { baseContractRoute, contractByIdRoute } from './routes';
import { getContractByIdAndProfileId, getContractsByProfileId } from './services';

export const contractByIdController = pathNested<typeof contractByIdRoute>()().get(async (request) => {
  const contract = await getContractByIdAndProfileId(request.params.id, request.context.profile.id);

  if (!contract) return Response.text('', { status: 404 });
  return Response.json(contract);
});

export const contractsController = pathNested<typeof baseContractRoute>()().get(async (request) => {
  const contracts = await getContractsByProfileId(request.context.profile.id);

  return Response.json(contracts);
});
