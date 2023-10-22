import { Response, pathNested } from '@palmares/server';

import { getUnpaidJobs, payJobId } from './services';
import { Jobs } from './models';

import type { unpaidJobsRouter, payJobIdRouter } from './routes';

export const unpaidJobsController = pathNested<typeof unpaidJobsRouter>()().get(async (request) => {
  //const contract = await getUnpaidJobs(request.context.profile.id);

  return Response.json([]);
});

export const payJobIdController = pathNested<typeof payJobIdRouter>()().post(async (request) => {
  /*const isOk = await payJobId(
    request.context.profile.id,
    request.context.profile.balance,
    request.body.amount,
    request.params.jobId
  );*/
  console.log('teste');
  const jobs = await Jobs.default.get();
  console.log(jobs);
  //if (isOk) return Response.text('', { status: 200 });
  return Response.text('User does not have enough credits or job id does not exist', { status: 400 });
});
