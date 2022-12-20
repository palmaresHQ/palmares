import model, { Model } from '../model';

export type Includes =
  | readonly {
      model: ReturnType<typeof model>;
      includes?: Includes;
    }[]
  | undefined;

export type ExtractModelFromIncludesType<
  I extends Includes,
  TOnlyModels extends readonly Model[]
> = I extends readonly [{ model: infer TModel }, ...infer TRest]
  ? TModel extends ReturnType<typeof model>
    ? ExtractModelFromIncludesType<
        TRest extends Includes ? TRest : undefined,
        readonly [...TOnlyModels, InstanceType<TModel>]
      >
    : TOnlyModels
  : TOnlyModels;
