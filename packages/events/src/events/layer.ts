import EventEmitter from '.';
import Emitter from '../emitter';
import { EventEmitterOptionsType } from './types';

export default class LayerEmitter<
  E extends Emitter = Emitter
> extends EventEmitter<E> {
  static async new<E extends typeof Emitter = typeof Emitter>(
    emitter: Promise<{ default: E }> | E,
    /** Those are the channels that it will listen for messages */
    options?: EventEmitterOptionsType & {
      customParams?: ConstructorParameters<E>;
      channels: string[];
    }
  ) {
    const layerEventEmitterConstructor = EventEmitter.new.bind(this);
    const layerEmitterInstance = (await layerEventEmitterConstructor(emitter, {
      ...options,
      wildcards: {
        use: false,
      },
    })) as LayerEmitter<InstanceType<E>>;
    await layerEmitterInstance.addChannelListeners(
      options?.channels || ['all']
    );
    return layerEmitterInstance;
  }

  async #getLayerListener() {
    return (
      resultsEventName: string,
      resultKey: string,
      channel: string,
      data: {
        key: string;
        data: any[];
      }
    ) => {
      this.emitEventToEmitter(
        data.key,
        resultsEventName,
        resultKey,
        channel,
        ...(data.data || [])
      );
    };
  }

  private async addChannelListeners(channels: string[]) {
    const promises = [] as Promise<() => Promise<void>>[];
    for (const channel of channels) {
      promises.push(
        this.addRawEventListenerWithoutResult(
          channel,
          await this.#getLayerListener()
        )
      );
    }
    await Promise.all(promises);
  }
}
