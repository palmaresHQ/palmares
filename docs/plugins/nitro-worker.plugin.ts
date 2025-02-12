import { defineNitroPlugin } from 'nitropack/runtime/plugin';
import { isChromium } from '../utils/is-chromium';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const headersAsEntries = event.headers.entries();
    const headers = Object.fromEntries(Array.from(headersAsEntries));
    console.log(headers);
    const isChromiumBrowser = isChromium(headers);
    console.log(isChromiumBrowser);
    if (/\.worker(?:-[A-Za-z0-9-]+)?\.js$/.test(event.path)) {
      if (isChromiumBrowser) {
        event.node.res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        event.node.res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      } else {
        event.node.res.setHeader('Cache-Control', 'no-store');
        event.node.res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        event.node.res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
      }
    }
  });
});
