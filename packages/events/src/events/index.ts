import { uuid } from '../utils';
import type { EventEmitterOptionsType } from './types';

export default class EventEmitter {
  #delimiter: string;
  #wildcards: boolean;
  #groupByKeys: Record<string, Set<string>> = {};
  #groups: Record<
    string,
    { keys: string[]; listeners: Record<string, (...args: any) => any> }
  > = {};

  constructor(options?: EventEmitterOptionsType) {
    this.#delimiter =
      typeof options?.delimiter === 'string' ? options.delimiter : '.';
    this.#wildcards =
      typeof options?.wildcards === 'boolean' ? options.wildcards : false;
  }

  #addListenerWithoutWildcards(
    handlerGroupId: string,
    handlerId: string,
    key: string,
    callback: (...args: any) => any
  ) {
    if (key in this.#groupByKeys === false)
      this.#groupByKeys[key] = new Set([handlerGroupId]);

    if (this.#groups[handlerGroupId])
      this.#groups[handlerGroupId].listeners[handlerId] = callback;
    else {
      this.#groups[handlerGroupId] = {
        listeners: {
          [handlerId]: callback,
        },
        keys: [key],
      };
    }
  }

  #addListenerThatAlreadyExistsWithWildcards(
    handlerGroupId: string,
    handlerId: string,
    callback: (...args: any) => any
  ) {
    this.#groups[handlerGroupId].listeners[handlerId] = callback;
  }

  #addListenerWithWildcards(
    handlerGroupId: string,
    handlerId: string,
    key: string,
    callback: (...args: any) => any
  ) {
    // Add the group of events that will be fired.
    const splittedKey = key.split(this.#delimiter);
    const allKeysOfKey = ['**'];

    if (this.#groupByKeys['**']) this.#groupByKeys['**'].add(handlerGroupId);
    else this.#groupByKeys['**'] = new Set([handlerGroupId]);

    let appendedKey = '';
    for (let i = 0; i < splittedKey.length; i++) {
      const isLastKey = i === splittedKey.length - 1;
      const eachKey = splittedKey[i];
      const newAppendedKey = `${appendedKey}${
        i > 0 ? this.#delimiter : ''
      }${eachKey}`;

      if (isLastKey) {
        const wildCardLastKey = `${appendedKey}${
          i > 0 ? this.#delimiter : ''
        }*`;
        if (this.#groupByKeys[wildCardLastKey])
          this.#groupByKeys[wildCardLastKey].add(handlerGroupId);
        else this.#groupByKeys[wildCardLastKey] = new Set([handlerGroupId]);

        const completeKey = newAppendedKey;
        if (this.#groupByKeys[completeKey])
          this.#groupByKeys[completeKey].add(handlerGroupId);
        else this.#groupByKeys[completeKey] = new Set([handlerGroupId]);

        allKeysOfKey.push(wildCardLastKey, completeKey);
      } else {
        const deepNestedKey = `${newAppendedKey}${this.#delimiter}**`;
        if (this.#groupByKeys[deepNestedKey])
          this.#groupByKeys[deepNestedKey].add(handlerGroupId);
        else this.#groupByKeys[deepNestedKey] = new Set([handlerGroupId]);

        allKeysOfKey.push(deepNestedKey);
      }
      appendedKey = newAppendedKey;
    }

    if (this.#groups[handlerGroupId])
      this.#groups[handlerGroupId].listeners[handlerId] = callback;
    else {
      this.#groups[handlerGroupId] = {
        listeners: {
          [handlerId]: callback,
        },
        keys: allKeysOfKey,
      };
    }
  }

  addEventListener(key: string, callback: (...args: any) => any) {
    // A group means another handler for the same key. For example, to listeners to `users.create.index` will point to the same
    // group but are different handlers. Generally speaking, the groupId will be the name of the event that you should append
    // in your custom listeners.
    const handlerGroupId =
      key in this.#groupByKeys
        ? [...this.#groupByKeys[key].values()][0]
        : uuid();
    const handlerId = uuid();

    if (this.#wildcards) {
      if (key in this.#groupByKeys)
        this.#addListenerThatAlreadyExistsWithWildcards(
          handlerGroupId,
          handlerId,
          callback
        );
      else
        this.#addListenerWithWildcards(
          handlerGroupId,
          handlerId,
          key,
          callback
        );
    } else {
      this.#addListenerWithoutWildcards(
        handlerGroupId,
        handlerId,
        key,
        callback
      );
    }
    return this.unsubscribe(handlerGroupId, handlerId);
  }

  unsubscribe(handlerGroupId: string, handlerId: string) {
    return () => {
      const doesGroupStillExists = handlerGroupId in this.#groups;
      const doesHandlerStillExists =
        doesGroupStillExists &&
        handlerId in this.#groups[handlerGroupId].listeners;
      const isLastListenerFromGroup =
        doesHandlerStillExists &&
        Object.keys(this.#groups[handlerGroupId].listeners).length === 1;
      if (doesHandlerStillExists) {
        const listener = this.#groups[handlerGroupId].listeners[handlerId];
        delete this.#groups[handlerGroupId].listeners[handlerId];

        if (isLastListenerFromGroup) {
          for (const keyToRemoveIdFrom of this.#groups[handlerGroupId].keys) {
            this.#groupByKeys[keyToRemoveIdFrom].delete(handlerGroupId);
            const isHandlerByKeyEmpty =
              this.#groupByKeys[keyToRemoveIdFrom].size === 0;
            if (isHandlerByKeyEmpty)
              delete this.#groupByKeys[keyToRemoveIdFrom];
          }
          delete this.#groups[handlerGroupId];
        }
        console.log(listener.toString());
      }
    };
  }

  //async emit(key: string) {}
}

const eventEmitter = new EventEmitter({ wildcards: true });
eventEmitter.addEventListener('add.user.index', () => {
  console.log('firstHandler');
});
eventEmitter.addEventListener('add.user.index', () => {
  console.log('secondHandler');
});

const unsubscribe = eventEmitter.addEventListener('add.user.create', () => {
  console.log('third handler');
});

unsubscribe();
