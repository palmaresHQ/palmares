import FieldAdapter from '.';
import { NumberAdapterTranslateArgs } from '../types';

export default class NumberFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: NumberAdapterTranslateArgs) {}
}
