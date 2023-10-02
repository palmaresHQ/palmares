export function removeColorsFormatting(message: string) {
  return message.replace(/\x1b\[\d+m/g, '');
}
