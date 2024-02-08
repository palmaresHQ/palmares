import FieldAdapter from '.';
import { ObjectAdapterTranslateArgs } from '../types';

export default class ObjectFieldAdapter<TResult = any> extends FieldAdapter<TResult> {
  translate(_fieldAdapter: FieldAdapter<any>, _args: ObjectAdapterTranslateArgs) {}
}
