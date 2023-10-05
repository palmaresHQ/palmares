import { SequelizeModel } from '@palmares/sequelize-engine';
import { Op } from 'sequelize';

import { Profile } from '../auth/models';
import { Jobs } from '../jobs/models';
import { Contract } from '../contracts/models';

export async function depositAmountFromContractorIdToClientId(
  contractorId: number,
  clientId: number,
  amountToDeposit: number
) {
  const JobsSequelizeModel = (await Jobs.default.getInstance()) as SequelizeModel<Jobs>;
  const contract = await Contract.default.get({
    search: {
      clientId: clientId,
      contractorId: contractorId,
    },
    includes: [
      {
        model: Profile,
      },
    ],
  });
  const existsContractWithClientAndContractor = contract.length > 0;
  if (!existsContractWithClientAndContractor) return false;

  const clientProfile = contract[0].client;
  const contractsToPay = await Contract.default.get({
    fields: ['id', 'clientId', 'contractorId', 'status'],
    search: {
      clientId: clientId,
      status: {
        or: ['new', 'in_progress'],
      },
    },
  });
  const contractsIdsToPay = contractsToPay.map((contract) => contract.id);
  const profileClientAmountOfJobsToPay = await JobsSequelizeModel.sum('price', {
    where: {
      paid: false,
      contractId: {
        [Op.in]: contractsIdsToPay,
      },
    },
  });

  const depositCapLimit = 0.25 * profileClientAmountOfJobsToPay;
  if (amountToDeposit > depositCapLimit) amountToDeposit = depositCapLimit;

  await Profile.default.set(
    {
      balance: (clientProfile.balance || 0) + amountToDeposit,
    },
    {
      search: {
        id: clientId,
      },
    }
  );
  return true;
}
