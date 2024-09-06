export function hashString(stringToHash: string): string {
  // P and M
  const p = 53;
  const m = 1e9 + 9;
  let powerOfP = 1;
  let hashValue = 0;

  // Loop to calculate the hash value
  // by iterating over the elements of string
  // javascript's ord() function is `.charCodeAt`
  // reference: https://stackoverflow.com/a/40100290
  // eslint-disable-next-line ts/prefer-for-of
  for (let i = 0; i < stringToHash.length; i++) {
    hashValue = (hashValue + (stringToHash[i].charCodeAt(0) - 'a'.charCodeAt(0) + 1) * powerOfP) % m;
    powerOfP = (powerOfP * p) % m;
  }

  return hashValue.toString();
}
