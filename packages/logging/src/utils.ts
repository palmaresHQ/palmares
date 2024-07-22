export function removeColorsFormatting(message: string) {
  // eslint-disable-next-line no-control-regex
  return message.replace(/\x1b\[\d+m/g, '');
}
