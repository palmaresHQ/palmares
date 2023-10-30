import { adapterSearchQuery } from '@palmares/databases';
import { Op } from 'sequelize';

export default adapterSearchQuery({
  parseSearchFieldValue: async (operationType, value, result, options) => {
    switch (operationType) {
      case 'like':
        if (options?.ignoreCase) result[Op.iLike] = value;
        else if (options?.isNot && options.ignoreCase) result[Op.notILike] = value;
        else if (options?.isNot) result[Op.notLike] = value;
        else result[Op.like] = value;
        return;
      case 'is':
        if (value === null && options?.isNot) result[Op.not] = value;
        else if (value === null) result[Op.is] = value;
        else if (options?.isNot) result[Op.ne] = value;
        else result[Op.eq] = value;
        return;
      case 'in':
        if (options?.isNot) result[Op.notIn] = value;
        else result[Op.in] = value;
        return;
      case 'between':
        if (options?.isNot) result[Op.notBetween] = value;
        else result[Op.between] = value;
        return;
      case 'and':
        result[Op.and] = value;
        return;
      case 'or':
        result[Op.or] = value;
        return;
      case 'greaterThan':
        result[Op.gt] = value;
        return;
      case 'greaterThanOrEqual':
        result[Op.gte] = value;
        return;
      case 'lessThan':
        result[Op.lt] = value;
        return;
      case 'lessThanOrEqual':
        result[Op.lte] = value;
        return;
      default:
        return;
    }
  },
});
