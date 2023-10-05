import Engine from '../engine';

export type QueryDataFnType =
  | ((
      engine: Engine,
      args: { modelOfEngineInstance: any; search: any; data: any; transaction?: any }
    ) => Promise<[boolean, any][]>)
  | ((
      engine: Engine,
      args: {
        modelOfEngineInstance: any;
        search: any;
        shouldReturnData?: boolean;
        shouldRemove?: boolean;
        transaction?: any;
      }
    ) => Promise<any>)
  | ((
      engine: Engine,
      args: {
        modelOfEngineInstance: any;
        search: any;
        fields: readonly string[];
        ordering?: any;
        limit?: number;
        offset?: number | string;
      }
    ) => Promise<any>);
