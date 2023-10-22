import { model } from '../models';
import { onRemoveFunction, onSetFunction } from '../models/types';

export function extractDefaultEventsHandlerFromModel<
  TModel extends InstanceType<ReturnType<typeof model>>,
  TFunctionType extends 'onSet' | 'onRemove',
>(
  modelInstance: TModel,
  functionType: TFunctionType
): (TFunctionType extends 'onSet' ? onSetFunction<TModel> : onRemoveFunction<TModel>) | void {
  if (typeof modelInstance.options?.[functionType] === 'function') {
    return modelInstance.options[functionType] as TFunctionType extends 'onSet'
      ? onSetFunction<TModel>
      : onRemoveFunction<TModel>;
  } else if (
    typeof modelInstance.options?.[functionType] === 'object' &&
    (modelInstance.options[functionType] as any).handler === 'function'
  ) {
    return (modelInstance.options[functionType] as any).handler as TFunctionType extends 'onSet'
      ? onSetFunction<TModel>
      : onRemoveFunction<TModel>;
  }

  return;
}
