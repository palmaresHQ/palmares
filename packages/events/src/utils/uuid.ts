/**
 * Generates a random uuid for
 */
export default function uuid() {
  let date = new Date().getTime();
  let performanceDate =
    (performance && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (character) => {
      let randomNumber = Math.random() * 16;
      if (date > 0) {
        randomNumber = (date + randomNumber) % 16 | 0;
        date = Math.floor(date / 16);
      } else {
        randomNumber = (performanceDate + randomNumber) % 16 | 0;
        performanceDate = Math.floor(performanceDate / 16);
      }
      return (
        character === 'x' ? randomNumber : (randomNumber & 0x3) | 0x8
      ).toString(16);
    }
  );
}
