// app.config.ts
import { defineConfig } from "@tanstack/start/config";

// utils/is-chromium.ts
function isChromium(headers) {
  const isChromiumFromServer = headers?.["user-agent"]?.includes("Chrome");
  if (isChromiumFromServer)
    return true;
  if (typeof navigator === "undefined")
    return false;
  return navigator.userAgent.indexOf("Chrome") !== -1;
}

// plugins/vite-worker-plugin.ts
function monacoWorkerPlugin() {
  return {
    name: "monaco-worker-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const isChromiumBrowser = isChromium(req.headers);
        if (/\.worker(?:-[A-Za-z0-9-]+)?\.js/.test(req.url || "")) {
          if (isChromiumBrowser) {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          } else {
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
            res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const isChromiumBrowser = isChromium(req.headers);
        if (/\.worker(?:-[A-Za-z0-9-]+)?\.js/.test(req.url || "")) {
          if (isChromiumBrowser) {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          } else {
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
            res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
          }
        }
        next();
      });
    }
  };
}

// app.config.ts
var app_config_default = defineConfig({
  server: {
    preset: "vercel",
    plugins: ["./plugins/nitro-worker.plugin.ts"],
    routeRules: {
      "/assets/**": {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin"
        }
      },
      "/_build/assets/**": {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin"
        }
      }
    }
  },
  vite: {
    plugins: [monacoWorkerPlugin()],
    worker: {
      format: "es"
    }
  }
});
export {
  app_config_default as default
};
