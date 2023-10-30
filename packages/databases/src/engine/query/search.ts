import { OperatorsOfQuery } from '../../models/types';
import type AdapterFieldParser from '../fields/field';

/**
 * Functional approach to the search query adapter.
 *
 * This engine query interface is used for the search arguments of a query, when making a query we should parse the search so we support stuff like
 * `like`, `in`, `is`, `between` and so on.
 */
export function adapterSearchQuery<
  TFunctionParseSearchFieldValue extends AdapterSearchQuery['parseSearchFieldValue'],
>(args: {
  /**
   * This will pretty much receive the search value and parse it and translate that into an object for each field..
   * The nicest thing is that we send you the `result`. This way you can organize the `search` object the way that you want and makes sense for your engine.
   *
   * @example
   * ```ts
   *  async parseSearchFieldValue<OperationType extends OperatorsOfQuery>(
   *    operationType: OperationType,
   *    value?: (OperationType extends 'or' | 'and' | 'in' | 'between' ? unknown[] : unknown) | undefined,
   *    result?: any,
   *    options?: { isNot?: boolean | undefined; ignoreCase?: boolean | undefined } | undefined
   *  ): Promise<any> {
   *    switch (operationType) {
   *      case 'like':
   *        if (options?.ignoreCase) result[Op.iLike] = value;
   *        else if (options?.isNot && options.ignoreCase) result[Op.notILike] = value;
   *        else if (options?.isNot) result[Op.notLike] = value;
   *        else result[Op.like] = value;
   *        return;
   *      case 'is':
   *        if (value === null && options?.isNot) result[Op.not] = value;
   *        else if (value === null) result[Op.is] = value;
   *        else if (options?.isNot) result[Op.ne] = value;
   *        else result[Op.eq] = value;
   *        return;
   *      case 'in':
   *        if (options?.isNot) result[Op.notIn] = value;
   *        else result[Op.in] = value;
   *        return;
   *      case 'between':
   *        if (options?.isNot) result[Op.notBetween] = value;
   *        else result[Op.between] = value;
   *        return;
   *      case 'and':
   *        result[Op.and] = value;
   *        return;
   *      case 'or':
   *        result[Op.or] = value;
   *        return;
   *      case 'greaterThan':
   *        result[Op.gt] = value;
   *        return;
   *      case 'greaterThanOrEqual':
   *        result[Op.gte] = value;
   *        return;
   *      case 'lessThan':
   *        result[Op.lt] = value;
   *        return;
   *      case 'lessThanOrEqual':
   *        result[Op.lte] = value;
   *        return;
   *      default:
   *        return;
   *    }
   *  }
   * ```
   *
   * @param operationType - The operation type of the query, this can be `like`, `in`, `is`, `between` and so on.
   * @param value - The value of the query, if the operation is `or`, `and`, `in` or `between` this will be an array of values, otherwise this can be a string, a number and such. Be aware that
   * this respects the `inputParser` of the field if you have implemented it on {@link AdapterFieldParser}. This is nice because we can maintain the types of the fields through the framework
   * and you can parse the way that makes sense for your engine.
   * @param result - This is the result we will use on the query. It's an object that you can append the result of the parsing.
   * @param options - This is an object with some options that you can use to parse the query, like if it's a negative query, if it's case insensitive and so on.
   *
   * @returns - Values are changed in-place, so you should not return anything.
   */
  parseSearchFieldValue: TFunctionParseSearchFieldValue;
}) {
  class CustomAdapterQuerySearch extends AdapterSearchQuery {
    parseSearchFieldValue = args.parseSearchFieldValue as TFunctionParseSearchFieldValue;
  }

  return CustomAdapterQuerySearch as typeof AdapterSearchQuery & {
    new (): AdapterSearchQuery & { parseSearchFieldValue: TFunctionParseSearchFieldValue };
  };
}
/**
 * This engine query interface is used for the search arguments of a query, when making a query we should parse the search so we support stuff like
 * `like`, `in`, `is`, `between` and so on.
 */
export default class AdapterSearchQuery {
  /**
   * This will pretty much receive the search value and parse it and translate that into an object for each field..
   * The nicest thing is that we send you the `result`. This way you can organize the `search` object the way that you want and makes sense for your engine.
   *
   * @example
   * ```ts
   *  async parseSearchFieldValue<OperationType extends OperatorsOfQuery>(
   *    operationType: OperationType,
   *    value?: (OperationType extends 'or' | 'and' | 'in' | 'between' ? unknown[] : unknown) | undefined,
   *    result?: any,
   *    options?: { isNot?: boolean | undefined; ignoreCase?: boolean | undefined } | undefined
   *  ): Promise<any> {
   *    switch (operationType) {
   *      case 'like':
   *        if (options?.ignoreCase) result[Op.iLike] = value;
   *        else if (options?.isNot && options.ignoreCase) result[Op.notILike] = value;
   *        else if (options?.isNot) result[Op.notLike] = value;
   *        else result[Op.like] = value;
   *        return;
   *      case 'is':
   *        if (value === null && options?.isNot) result[Op.not] = value;
   *        else if (value === null) result[Op.is] = value;
   *        else if (options?.isNot) result[Op.ne] = value;
   *        else result[Op.eq] = value;
   *        return;
   *      case 'in':
   *        if (options?.isNot) result[Op.notIn] = value;
   *        else result[Op.in] = value;
   *        return;
   *      case 'between':
   *        if (options?.isNot) result[Op.notBetween] = value;
   *        else result[Op.between] = value;
   *        return;
   *      case 'and':
   *        result[Op.and] = value;
   *        return;
   *      case 'or':
   *        result[Op.or] = value;
   *        return;
   *      case 'greaterThan':
   *        result[Op.gt] = value;
   *        return;
   *      case 'greaterThanOrEqual':
   *        result[Op.gte] = value;
   *        return;
   *      case 'lessThan':
   *        result[Op.lt] = value;
   *        return;
   *      case 'lessThanOrEqual':
   *        result[Op.lte] = value;
   *        return;
   *      default:
   *        return;
   *    }
   *  }
   * ```
   *
   * @param operationType - The operation type of the query, this can be `like`, `in`, `is`, `between` and so on.
   * @param value - The value of the query, if the operation is `or`, `and`, `in` or `between` this will be an array of values, otherwise this can be a string, a number and such. Be aware that
   * this respects the `inputParser` of the field if you have implemented it on {@link AdapterFieldParser}. This is nice because we can maintain the types of the fields through the framework
   * and you can parse the way that makes sense for your engine.
   * @param result - This is the result we will use on the query. It's an object that you can append the result of the parsing.
   * @param options - This is an object with some options that you can use to parse the query, like if it's a negative query, if it's case insensitive and so on.
   *
   * @returns - Values are changed in-place, so you should not return anything.
   */
  async parseSearchFieldValue<OperationType extends OperatorsOfQuery>(
    _operationType: OperationType,
    /**
     * This is the value of the query, if the operation is `or`, `and`, `in` or `between` this will be an array of values.
     */
    _value?: OperationType extends 'or' | 'and' | 'in' | 'between' ? unknown[] : unknown,
    /**
     * This is the result we will use on the query.
     */
    _result?: any,
    _options?: {
      isNot?: boolean;
      ignoreCase?: boolean;
    }
  ) {
    return Array.isArray(_value) ? _value[0] : _value;
  }
}
