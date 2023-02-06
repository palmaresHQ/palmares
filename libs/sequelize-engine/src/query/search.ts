import { EngineQuerySearch, OperatorsOfQuery } from '@palmares/databases';
import { Op } from 'sequelize';

export default class SequelizeEngineSearchQuery extends EngineQuerySearch {
  override async parseSearchFieldValue<OperationType extends OperatorsOfQuery>(
    operationType: OperationType,
    value?:
      | (OperationType extends 'or' | 'and' | 'in' | 'between'
          ? unknown[]
          : unknown)
      | undefined,
    result?: any,
    options?:
      | { isNot?: boolean | undefined; ignoreCase?: boolean | undefined }
      | undefined
  ): Promise<any> {
    switch (operationType) {
      case OperatorsOfQuery.like:
        if (options?.ignoreCase) result[Op.iLike] = value;
        else if (options?.isNot && options.ignoreCase)
          result[Op.notILike] = value;
        else if (options?.isNot) result[Op.notLike] = value;
        else result[Op.like] = value;
        return;
      case OperatorsOfQuery.is:
        if (value === null && options?.isNot) result[Op.not] = value;
        else if (value === null) result[Op.is] = value;
        else if (options?.isNot) result[Op.ne] = value;
        else result[Op.eq] = value;
        return;
      case OperatorsOfQuery.in:
        if (options?.isNot) result[Op.notIn] = value;
        else result[Op.in] = value;
        return;
      case OperatorsOfQuery.between:
        if (options?.isNot) result[Op.notBetween] = value;
        else result[Op.between] = value;
        return;
      case OperatorsOfQuery.and:
        result[Op.and] = value;
        return;
      case OperatorsOfQuery.or:
        result[Op.or] = value;
        return;
      case OperatorsOfQuery.greaterThan:
        result[Op.gt] = value;
        return;
      case OperatorsOfQuery.greaterThanOrEqual:
        result[Op.gte] = value;
        return;
      case OperatorsOfQuery.lessThan:
        result[Op.lt] = value;
        return;
      case OperatorsOfQuery.lessThanOrEqual:
        result[Op.lte] = value;
        return;
      default:
        return;
    }
  }
}
