import { Op } from 'sequelize';

import { Contract } from './models';

import type { Profile } from '../auth/models';
import type { ModelFields } from '@palmares/databases';
import type { SequelizeModel } from '@palmares/sequelize-engine';

type ProfileType = ModelFields<Profile>;

export async function getContractByIdAndProfileId(contractId: number, profileId: ProfileType['id']) {
  const contractSequelizeInstance = (await Contract.default.getInstance()) as SequelizeModel<Contract>;
  const contract = (await contractSequelizeInstance.findOne({
    where: {
      id: contractId,
      [Op.or]: [
        {
          contractorId: profileId
        },
        {
          clientId: profileId
        }
      ]
    },
    raw: true
  })) as ModelFields<Contract> | undefined | null;
  if (!contract) return;
  return contract;
}

export async function getContractsByProfileId(profileId: ProfileType['id']) {
  const contractSequelizeInstance = (await Contract.default.getInstance()) as SequelizeModel<Contract>;
  const contract = await contractSequelizeInstance.findAll({
    where: {
      [Op.or]: [
        {
          contractorId: profileId
        },
        {
          clientId: profileId
        }
      ]
    },
    raw: true
  });
  return contract as unknown as ModelFields<Contract>[];
}
