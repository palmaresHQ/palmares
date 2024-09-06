import { eventsDomain as EventsDomain } from './domain';

export { Emitter } from './emitter';
export { EventEmitter } from './events';
export { eventsServer, getEventsServer } from './server';
//export { default as LayerEmitter } from './events/layer';
export type { EventsDomainInterface } from './interfaces';

export { EventsDomain };
export default EventsDomain;
