import { removeQuery } from './queries/remove';
import { setQuery } from './queries/set';

import type { model } from './models/model';

/**
 * This class is responsible for controlling the transactions that happens inside of the framework,
 * this is supposed to be handled for the framework itself specially for distributed systems where
 * the data is stored in different places. The transaction instance is created so that the framework
 * can handle when something goes wrong and fails.
 */
export class Transaction {
  originalOperation: 'set' | 'remove';
  insertionOrdering: {
    orderingByEngines: Map<string, Map<string, number>>; //We can have the same model in different engines.
    currentOrderOfOperation: number;
  } = {
    orderingByEngines: new Map(),
    currentOrderOfOperation: 0
  };
  dataThatWasInsertedOrRemoved: Map<
    number,
    {
      engineName: string;
      model: ReturnType<typeof model>;
      data: Map<string, any[]>;
    }
  > = new Map();

  constructor(originalOperation: 'set' | 'remove') {
    this.originalOperation = originalOperation;
  }

  // eslint-disable-next-line ts/require-await
  async appendData(engineName: string, modelInstance: ReturnType<typeof model>, search: any, data: any[]) {
    const stringifiedSearch = JSON.stringify(search);
    const modelName = modelInstance.name;

    const existsEngineNameInOrdering = this.insertionOrdering.orderingByEngines.has(engineName);
    const existsOrdering =
      this.insertionOrdering.orderingByEngines.has(engineName) &&
      this.insertionOrdering.orderingByEngines.get(engineName)?.has(modelName);
    if (existsOrdering === false)
      this.insertionOrdering.currentOrderOfOperation = this.insertionOrdering.currentOrderOfOperation + 1;

    const insertionOrder = existsOrdering
      ? (this.insertionOrdering.orderingByEngines.get(engineName)?.get(modelName) as number)
      : this.insertionOrdering.currentOrderOfOperation;
    if (!existsEngineNameInOrdering)
      this.insertionOrdering.orderingByEngines.set(engineName, new Map([[modelName, insertionOrder]]));
    else this.insertionOrdering.orderingByEngines.get(engineName)?.set(modelName, insertionOrder);

    const existsSearchInData = this.dataThatWasInsertedOrRemoved.get(insertionOrder)?.data.has(stringifiedSearch);

    if (existsSearchInData)
      this.dataThatWasInsertedOrRemoved
        .get(insertionOrder)
        ?.data.get(stringifiedSearch)
        ?.push(...data);
    else
      this.dataThatWasInsertedOrRemoved.set(insertionOrder, {
        engineName,
        model: modelInstance,
        data: new Map([[stringifiedSearch, data]])
      });
  }

  async rollback(currentIndexToProcess = this.insertionOrdering.currentOrderOfOperation) {
    const firstModelToProcess = this.dataThatWasInsertedOrRemoved.get(currentIndexToProcess);
    const engineToUse = await firstModelToProcess?.model.default.getEngineInstance(firstModelToProcess.engineName);
    if (!engineToUse || !firstModelToProcess) return;
    await engineToUse.useTransaction(async (transaction) => {
      let dataToProcess = this.dataThatWasInsertedOrRemoved.get(currentIndexToProcess);
      while (dataToProcess && dataToProcess.engineName === firstModelToProcess.engineName) {
        const promises: Promise<void>[] = [];
        if (this.originalOperation === 'set') {
          for (const [search, data] of dataToProcess.data.entries()) {
            for (const dataThatWasSet of data) {
              const [dataWasUpdated, dataToSet] = dataThatWasSet as [boolean, any];
              promises.push(
                (async () => {
                  const searchObject = typeof search === 'string' ? JSON.parse(search) : search;
                  const formattedSearchObject = Object.keys(searchObject).length === 0 ? undefined : searchObject;
                  const model = dataToProcess.model.default.getModel(dataToProcess.engineName);
                  if (dataWasUpdated) {
                    await setQuery(
                      data,
                      {
                        isToPreventEvents: false,
                        useTransaction: false,
                        search: formattedSearchObject
                      },
                      {
                        model: model,
                        transaction: transaction,
                        engine: engineToUse,
                        includes: undefined
                      }
                    );
                  } else {
                    await removeQuery(
                      {
                        isToPreventEvents: false,
                        useTransaction: false,
                        search: dataToSet,
                        shouldRemove: true
                      },
                      {
                        model: model,
                        transaction: transaction,
                        engine: engineToUse,
                        includes: undefined
                      }
                    );
                  }
                })()
              );
            }
          }
          // eslint-disable-next-line ts/no-unnecessary-condition
        } else if (this.originalOperation === 'remove') {
          for (const [search, data] of dataToProcess.data.entries()) {
            for (const dataThatWasRemoved of data) {
              promises.push(
                (async () => {
                  const searchObject = typeof search === 'string' ? JSON.parse(search) : search;
                  // eslint-disable-next-line ts/no-unnecessary-condition
                  if (search === undefined) return;
                  const model = dataToProcess.model.default.getModel(dataToProcess.engineName);
                  await setQuery(
                    dataThatWasRemoved,
                    {
                      isToPreventEvents: false,
                      useTransaction: false,
                      search: searchObject
                    },
                    {
                      model: model,
                      transaction: transaction,
                      engine: engineToUse,
                      includes: undefined
                    }
                  );
                })()
              );
            }
          }
        }
        await Promise.all(promises); // we need to wait for every model because it can cause issues.
        this.dataThatWasInsertedOrRemoved.delete(currentIndexToProcess);
        currentIndexToProcess = currentIndexToProcess - 1;
        dataToProcess = this.dataThatWasInsertedOrRemoved.get(currentIndexToProcess);
      }
      if (this.dataThatWasInsertedOrRemoved.size > 0) return await this.rollback(currentIndexToProcess);
    });
  }
}
