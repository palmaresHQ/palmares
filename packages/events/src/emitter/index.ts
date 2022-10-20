import { uuid } from '../utils';

/**
 * Class responsible for emitting events. It works similarly to Node's EventEmitter but with a slight different api.
 */
export default class Emitter {
  private uniqueObserversByCallbackUuid: Record<string, string> = {};
  observers: Record<string, { key?: string; callback: (...args: any) => any }> =
    {};

  async unsubscribe(uuid: string) {
    return () => {
      delete this.observers[uuid];
    };
  }

  async addEventListener(
    callback: (...args: any) => any,
    options?: {
      key?: string;
      isUnique?: boolean;
    }
  ) {
    const callbackKey = uuid();
    const callbackFunctionAsString = callback.toString();
    const callbackUuidKeyForCallback =
      this.uniqueObserversByCallbackUuid[callbackFunctionAsString];
    const observerWasNotDefinedYet = callbackUuidKeyForCallback === undefined;
    const canAppendNewObserver =
      (options?.isUnique && observerWasNotDefinedYet) ||
      options?.isUnique !== true;
    if (canAppendNewObserver) {
      this.observers[callbackKey] = {
        key: options?.key,
        callback: callback,
      };
      this.uniqueObserversByCallbackUuid[callbackFunctionAsString] =
        callbackKey;
    }

    const callbackUuidToUnsubscribe =
      typeof callbackUuidKeyForCallback === 'string' && options?.isUnique
        ? callbackFunctionAsString
        : callbackKey;
    return this.unsubscribe(callbackUuidToUnsubscribe);
  }

  async emit(options?: { key?: string; data?: any }) {
    const isEmitKeyDefined = typeof options?.key === 'string';
    const observerValues = Object.values(this.observers);
    for (const observer of observerValues) {
      const isKeyOfObserverDefined = typeof observer.key === 'string';
      const canCallCallback =
        isKeyOfObserverDefined &&
        isEmitKeyDefined &&
        observer.key === options.key;
      if (canCallCallback) {
        setTimeout(() => observer.callback(options.data));
      }
    }
  }
}
