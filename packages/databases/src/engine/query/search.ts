import { OperatorsOfQuery } from '../../models/types';

/**
 * This engine query interface is used for the search arguments of a query, when making a query we should parse the search so we support stuff like
 * `like`, `in`, `is`, `between` and so on.
 */
export function adapterQuerySearch<
  TFunctionParseSearchFieldValue extends AdapterQuerySearch['parseSearchFieldValue'],
>(args: { parseSearchFieldValue: TFunctionParseSearchFieldValue }) {
  class CustomAdapterQuerySearch extends AdapterQuerySearch {
    parseSearchFieldValue = args.parseSearchFieldValue as TFunctionParseSearchFieldValue;
  }

  return CustomAdapterQuerySearch as typeof AdapterQuerySearch & {
    new (): AdapterQuerySearch & { parseSearchFieldValue: TFunctionParseSearchFieldValue };
  };
}
/**
 * This engine query interface is used for the search arguments of a query, when making a query we should parse the search so we support stuff like
 * `like`, `in`, `is`, `between` and so on.
 */
export default class AdapterQuerySearch {
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
