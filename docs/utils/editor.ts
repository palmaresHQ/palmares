import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { isChromium } from './is-chromium';

if (typeof window !== 'undefined' && window && window.self && typeof window.self !== 'undefined') {
  // @ts-ignore
  window.self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    }
  };
}

let promise:
  | undefined
  | Promise<{
      monaco: typeof import('monaco-editor');
      sandbox: typeof import('@typescript/sandbox');
      editorWorker: typeof import('monaco-editor/esm/vs/editor/editor.worker?worker');
      jsonWorker: typeof import('monaco-editor/esm/vs/language/json/json.worker?worker');
      cssWorker: typeof import('monaco-editor/esm/vs/language/css/css.worker?worker');
      htmlWorker: typeof import('monaco-editor/esm/vs/language/html/html.worker?worker');
      tsWorker: typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');
      webcontainerInstance?: Awaited<ReturnType<(typeof import('@webcontainer/api'))['WebContainer']['boot']>>;
      Terminal: (typeof import('@xterm/xterm'))['Terminal'];
      FitAddon: (typeof import('@xterm/addon-fit'))['FitAddon'];
    }> = undefined;

function initialSetupEditor(args: {
  editorWorker: typeof import('monaco-editor/esm/vs/editor/editor.worker?worker');
  jsonWorker: typeof import('monaco-editor/esm/vs/language/json/json.worker?worker');
  cssWorker: typeof import('monaco-editor/esm/vs/language/css/css.worker?worker');
  htmlWorker: typeof import('monaco-editor/esm/vs/language/html/html.worker?worker');
  tsWorker: typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');
  monaco: typeof import('monaco-editor');
}) {
  if (typeof window !== 'undefined' && window.self && typeof window.self !== 'undefined') {
    window.self.MonacoEnvironment = {
      getWorker(_: any, label: string) {
        if (label === 'json') return new args.jsonWorker.default();
        if (label === 'css' || label === 'scss' || label === 'less') return new args.cssWorker.default();
        if (label === 'html' || label === 'handlebars' || label === 'razor') return new args.htmlWorker.default();
        if (label === 'typescript' || label === 'javascript') return new args.tsWorker.default();

        return new args.editorWorker.default();
      }
    };

    args.monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  }
}

export function getEditor(): NonNullable<typeof promise> {
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    try {
      if (window?.self && typeof window.self !== 'undefined') {
        (
          Promise.all([
            import('@typescript/sandbox'),
            import('monaco-editor'),
            import('monaco-editor/esm/vs/editor/editor.worker?worker'),
            import('monaco-editor/esm/vs/language/json/json.worker?worker'),
            import('monaco-editor/esm/vs/language/css/css.worker?worker'),
            import('monaco-editor/esm/vs/language/html/html.worker?worker'),
            import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
            import('@webcontainer/api'),
            import('@xterm/xterm'),
            import('@xterm/addon-fit')
          ]) as Promise<
            [
              typeof import('@typescript/sandbox'),
              typeof import('monaco-editor'),
              typeof import('monaco-editor/esm/vs/editor/editor.worker?worker'),
              typeof import('monaco-editor/esm/vs/language/json/json.worker?worker'),
              typeof import('monaco-editor/esm/vs/language/css/css.worker?worker'),
              typeof import('monaco-editor/esm/vs/language/html/html.worker?worker'),
              typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
              typeof import('@webcontainer/api'),
              typeof import('@xterm/xterm'),
              typeof import('@xterm/addon-fit')
            ]
          >
        )
          .then((importResult) => {
            const monaco = importResult[1];
            const sandbox = importResult[0];
            const editorWorker = importResult[2];
            const jsonWorker = importResult[3];
            const cssWorker = importResult[4];
            const htmlWorker = importResult[5];
            const tsWorker = importResult[6];
            const webcontainer = importResult[7].WebContainer;
            const Terminal = importResult[8].Terminal;
            const FitAddon = importResult[9].FitAddon;

            initialSetupEditor({
              editorWorker,
              jsonWorker,
              cssWorker,
              htmlWorker,
              tsWorker,
              monaco
            });

            if (isChromium()) {
              return webcontainer
                .boot({ coep: 'require-corp' })
                .then((webcontainerInstance) => {
                  resolve({
                    monaco,
                    sandbox,
                    editorWorker,
                    jsonWorker,
                    cssWorker,
                    htmlWorker,
                    tsWorker,
                    Terminal,
                    FitAddon,
                    webcontainerInstance
                  });
                })
                .catch(reject);
            }

            resolve({
              monaco,
              sandbox,
              editorWorker,
              jsonWorker,
              cssWorker,
              htmlWorker,
              tsWorker,
              Terminal,
              FitAddon,
              webcontainerInstance: undefined
            });
          })
          .catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
  return promise;
}
