/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-named-as-default
import type EngineQuery from '.';
import { BaseModel } from '../../models';
import model from '../../models/model';
import { FieldWithOperationType, OperatorsOfQuery } from '../../models/types';

/**
 * This engine query interface is used for the search arguments of a query, when making a query we should parse the search so we support stuff like
 * `like`, `in`, `is`, `between` and so on.
 */
export default class EngineQuerySearch {
  async parseSearchFieldValue<OperationType extends OperatorsOfQuery>(
    _operationType: OperationType,
    /**
     * This is the value of the query
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
