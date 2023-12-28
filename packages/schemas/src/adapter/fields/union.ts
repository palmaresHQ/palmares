import FieldAdapter from '.';
import { UnionAdapterTranslateArgs } from '../types';

export default class UnionFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: UnionAdapterTranslateArgs) {}

  parse = undefined;
}
