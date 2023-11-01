import { ModelFields } from '@palmares/databases';
import SequelizeEngine from '@palmares/sequelize-engine';

import { Profile } from '../auth/models';
import { Jobs } from './models';
import { Contract } from '../contracts/models';

type ProfileType = ModelFields<Profile>;

export async function getUnpaidJobs(profileId: ProfileType['id']) {
  const unpaidJobsForContractor = await Promise.all([
    Jobs.default.get({
      search: {
        paid: false,
        contract: {
          clientId: profileId,
          status: {
            or: ['new', 'in_progress'],
          },
        },
      },
      includes: [
        {
          model: Contract,
        },
      ],
    }),
    Jobs.default.get({
      search: {
        paid: false,
        contract: {
          contractorId: profileId,
          status: {
            or: ['new', 'in_progress'],
          },
        },
      },
      includes: [
        {
          model: Contract,
        },
      ],
    }),
  ]);
  return unpaidJobsForContractor[0].concat(unpaidJobsForContractor[1]);
}

export async function payJobId(
  profileId: number,
  profileBalance: ProfileType['balance'] | undefined,
  amountToPay: number,
  jobId: number
) {
  const profileBalanceAsNumber: number = profileBalance || 0;
  if (profileBalanceAsNumber < amountToPay) return false;
  const engineInstance = await Jobs.default.getEngineInstance<InstanceType<typeof SequelizeEngine>>();
  const jobs = await Jobs.default.get({
    search: {
      id: jobId,
      contract: {
        client: {
          id: profileId,
        },
        status: {
          or: ['new', 'in_progress'],
        },
      },
    },
    includes: [
      {
        model: Contract,
        includes: [
          {
            model: Profile,
          },
        ],
      },
    ],
  });
  if (!jobs.length) return false;
  const job = jobs[0];
  const contractorId = job.contract.contractor.id;
  const contractorBalance = job.contract.contractor.balance || 0;

  await engineInstance.useTransaction(async (transaction) => {
    await Promise.all([
      Profile.default.set(
        {
          balance: profileBalanceAsNumber - amountToPay,
        },
        {
          transaction,
          search: {
            id: profileId,
          },
        }
      ),
      Profile.default.set(
        {
          balance: contractorBalance + amountToPay,
        },
        {
          transaction,
          search: {
            id: contractorId,
          },
        }
      ),
    ]);
  });
  return true;
}
