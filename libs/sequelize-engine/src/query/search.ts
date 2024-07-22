import { adapterSearchQuery } from '@palmares/databases';
import { Op } from 'sequelize';

export default adapterSearchQuery({
  // eslint-disable-next-line ts/require-await
  parseSearchFieldValue: async (operationType, key, _model, value, result, options) => {
    switch (operationType) {
      case 'like':
        if (options?.ignoreCase) result[key] = {
          [Op.iLike]: value
        };
        else if (options?.isNot && options.ignoreCase) result[key] = {
          [Op.notILike]: value
        };
        else if (options?.isNot) result[key] = {
          [Op.notLike]: value
        };
        else result[key] = {
          [Op.like]: value
        };
        return;
      case 'is':
        if (value === null && options?.isNot)
          result[key] = {
            [Op.not]: value
          };
        else if (value === null)
          result[key] = {
            [Op.is]: value
          };
        else if (options?.isNot)
          result[key] = {
            [Op.ne]: value
          };
        else
          result[key] = {
            [Op.ne]: value
          };
        return;
      case 'in':
        if (options?.isNot)
          result[key] = {
            [Op.notIn]: value
          };
        else
          result[key] = {
            [Op.in]: value
          };
        return;
      case 'between':
        if (options?.isNot)
          result[key] = {
            [Op.notBetween]: value
          };
        else
          result[key] = {
            [Op.between]: value
          };
        return;
      case 'and':
        result[key] = {
          [Op.and]: value
        };
        return;
      case 'or':
        result[key] = {
          [Op.or]: value
        };
        return;
      case 'greaterThan':
        result[key] = {
          [Op.gt]: value
        };
        return;
      case 'greaterThanOrEqual':
        result[key] = {
          [Op.gte]: value
        };
        return;
      case 'lessThan':
        result[key] = {
          [Op.lt]: value
        };
        return;
      case 'lessThanOrEqual':
        result[key] = {
          [Op.lte]: value
        };
        return;
      default:
        result[key] = value
    }
  }
});
