export function makeRandomId() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 500; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
