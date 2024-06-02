import FieldAdapter from '.';
import WithFallback from '../../utils';
import { StringAdapterTranslateArgs } from '../types';

export default class StringFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: StringAdapterTranslateArgs): any | WithFallback {}
}
