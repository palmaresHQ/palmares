import { Response, pathNested } from '@palmares/server';

import { getUnpaidJobs, payJobId } from './services';

import type { unpaidJobsRouter, payJobIdRouter } from './routes';

export const unpaidJobsController = pathNested<typeof unpaidJobsRouter>()().get(async (request) => {
  // haven't defined any type, where does this comes from?
  request.context.anotherValue;
  const contract = await getUnpaidJobs(request.context.profile.id);
  return Response.json(contract);
});

export const payJobIdController = pathNested<typeof payJobIdRouter>()().post(async (request) => {
  const isOk = await payJobId(
    request.context.profile.id,
    request.context.profile.balance,
    request.body.amount,
    request.params.jobId
  );

  if (isOk) return Response.text('', { status: 200 });
  return Response.text('User does not have enough credits or job id does not exist', { status: 400 });
});
