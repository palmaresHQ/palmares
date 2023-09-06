import type { performance } from 'perf_hooks';

/**
 * Generates a random uuid for each event so we change the actual name of the event with uuids.
 */
export default function uuid() {
  let date = new Date().getTime();
  const browserOrNodePerformance = (globalThis as any).performance as typeof performance | undefined;
  let performanceDate =
    (browserOrNodePerformance && browserOrNodePerformance.now && browserOrNodePerformance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    let randomNumber = Math.random() * 16;
    if (date > 0) {
      randomNumber = (date + randomNumber) % 16 | 0;
      date = Math.floor(date / 16);
    } else {
      randomNumber = (performanceDate + randomNumber) % 16 | 0;
      performanceDate = Math.floor(performanceDate / 16);
    }
    return (character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8).toString(16);
  });
}
