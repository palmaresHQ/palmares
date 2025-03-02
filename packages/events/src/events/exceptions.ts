export class NoLayerError extends Error {
  constructor() {
    super('Your emitter does not have a layer. You should add a layer before trying to emit an event to the layer');
    this.name = NoLayerError.name;
  }
}
