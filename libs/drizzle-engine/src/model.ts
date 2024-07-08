import { adapterModels, ModelOptionsType } from '@palmares/databases';


export default adapterModels({
  translateOptions: async (_engine, _modelName, options): Promise<{}> => {
    return {};
  },
  translate: async (
    engine,
    modelName,
    _model,
    _fieldEntriesOfModel,
    modelOptions,
    defaultTranslateCallback: () => Promise<{ options: {}, fields: {}}>,
    _,
    __
  ): Promise<undefined> => {
    const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();
    return undefined;
  },
});
