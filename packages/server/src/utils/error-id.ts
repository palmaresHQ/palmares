/**
 * This is a variation of:
 * Reference: https://stackoverflow.com/a/8809472
 *
 * We don't generate an UUID, instead it's a fake id so we don't clash with the user's routes.
 */
export function generateErrorId() {
  let date = new Date().getTime(); //Timestamp
  const performance = (globalThis as any).performance as typeof import('perf_hooks')['performance'];
  let performanceDate = (performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'x-xx_x-xx_x-xx_x-xx_x-xx_y-xx_x-xx_x-xx_x-xx_x-xx_x'.replace(/[xy]/g, (character) => {
    let randomNumber = Math.random() * 16; //random number between 0 and 16
    if (date > 0) {
      //Use timestamp until depleted
      randomNumber = (date + randomNumber) % 16 | 0;
      date = Math.floor(date / 16);
    } else {
      //Use microseconds since page-load if supported
      randomNumber = (performanceDate + randomNumber) % 16 | 0;
      performanceDate = Math.floor(performanceDate / 16);
    }
    return (character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8).toString(16);
  });
}
