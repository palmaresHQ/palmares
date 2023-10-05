import { SequelizeModel } from '@palmares/sequelize-engine';
import { ModelFields } from '@palmares/databases';
import sequelize from 'sequelize';

import { Jobs } from '../jobs/models';
import { Contract } from '../contracts/models';
import { Profile } from '../auth/models';

export async function getBestProfession(start: Date, end: Date) {
  const JobsSequelizeModel = (await Jobs.default.getInstance()) as SequelizeModel<Jobs>;
  const ContractSequelizeModel = (await Contract.default.getInstance()) as SequelizeModel<Contract>;
  const ProfileSequelizeModel = (await Profile.default.getInstance()) as SequelizeModel<Profile>;
  const aggregatedPaidJobsSum = (await JobsSequelizeModel.findAll({
    attributes: [
      'contract.contractor.id',
      'contract.contractor.profession',
      [sequelize.fn('SUM', sequelize.col('price')), 'totalPrice'],
    ],
    where: {
      paid: true,
      paymentDate: {
        [sequelize.Op.between]: [start, end],
      },
    },
    include: [
      {
        model: ContractSequelizeModel,
        as: 'contract',
        where: {
          status: {
            [sequelize.Op.or]: ['new', 'in_progress'],
          },
        },
        include: [
          {
            model: ProfileSequelizeModel,
            as: 'contractor',
          },
        ],
      },
    ],
    group: ['contract.contractor.id'],
    limit: 1,
    order: [['totalPrice', 'DESC']],
    raw: true,
  })) as unknown as { profession: string; totalPrice: number }[];

  console.log(aggregatedPaidJobsSum);
  if (aggregatedPaidJobsSum.length === 0) return;
  else return aggregatedPaidJobsSum[0].profession;
}

export async function getBestClients(start: Date, end: Date, limit?: number) {
  limit = limit || 2;

  const JobsSequelizeModel = (await Jobs.default.getInstance()) as SequelizeModel<Jobs>;
  const ContractSequelizeModel = (await Contract.default.getInstance()) as SequelizeModel<Contract>;
  const ProfileSequelizeModel = (await Profile.default.getInstance()) as SequelizeModel<Profile>;

  const aggregatedPaidJobsSum = (await JobsSequelizeModel.findAll({
    attributes: [
      [sequelize.col('contract.client.id'), 'id'],
      [sequelize.col('contract.client.first_name'), 'firstName'],
      [sequelize.col('contract.client.last_name'), 'lastName'],
      [sequelize.col('contract.client.profession'), 'profession'],
      [sequelize.col('contract.client.balance'), 'balance'],
      [sequelize.col('contract.client.type'), 'type'],
      [sequelize.fn('SUM', sequelize.col('price')), 'totalPaid'],
    ],
    where: {
      paid: true,
      paymentDate: {
        [sequelize.Op.between]: [start, end],
      },
    },
    include: [
      {
        model: ContractSequelizeModel,
        as: 'contract',
        include: [
          {
            model: ProfileSequelizeModel,
            as: 'client',
          },
        ],
      },
    ],
    group: ['contract.client.id'],
    limit,
    order: [['totalPaid', 'DESC']],
    raw: true,
  })) as unknown as (ModelFields<Profile> & { totalPaid: number })[];

  return aggregatedPaidJobsSum;
}
