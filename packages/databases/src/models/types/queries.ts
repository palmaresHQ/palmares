import model from '../model';

export type Includes =
  | readonly {
      model: ReturnType<typeof model>;
      includes?: Includes;
    }[]
  | undefined;
