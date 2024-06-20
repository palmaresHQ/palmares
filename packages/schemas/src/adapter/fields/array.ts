import FieldAdapter from '.';
import WithFallback from '../../utils';
import { NumberAdapterTranslateArgs } from '../types';

export default class ArrayFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: NumberAdapterTranslateArgs): any | WithFallback<'array'> {}
}
