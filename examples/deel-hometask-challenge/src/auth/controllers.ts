import { Response, pathNested } from '@palmares/server';

import type { depositRouter } from './routes';
import { depositAmountFromContractorIdToClientId } from './services';

export const depositAmountController = pathNested<typeof depositRouter>()().post(async (request) => {
  if (request.context.profile.type !== 'contractor')
    return Response.text('Only contractors can deposit', { status: 400 });
  const isOk = await depositAmountFromContractorIdToClientId(
    request.context.profile.id,
    request.params.userId,
    request.body.amount
  );
  if (!isOk) return Response.text(`No contract found for user: ${request.params.userId}`, { status: 400 });
  return Response.text('', { status: 201 });
});
