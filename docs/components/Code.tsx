import '@xterm/xterm/css/xterm.css';

import { useRef, useEffect, useId } from 'react';
import type * as TMonaco from 'monaco-editor';
import typescript from 'typescript';
import { Terminal } from '@xterm/xterm';

let sandbox: typeof import('@typescript/sandbox');
let monaco: typeof import('monaco-editor');
let editorWorker: typeof import('monaco-editor/esm/vs/editor/editor.worker?worker');
let jsonWorker: typeof import('monaco-editor/esm/vs/language/json/json.worker?worker');
let cssWorker: typeof import('monaco-editor/esm/vs/language/css/css.worker?worker');
let htmlWorker: typeof import('monaco-editor/esm/vs/language/html/html.worker?worker');
let tsWorker: typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');
let webcontainerInstance: Awaited<ReturnType<(typeof import('@webcontainer/api'))['WebContainer']['boot']>>;

if (typeof self !== 'undefined') {
  const importResult = (await Promise.all([
    import('@typescript/sandbox'),
    import('monaco-editor'),
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
    import('@webcontainer/api')
  ])) as [
    typeof import('@typescript/sandbox'),
    typeof import('monaco-editor'),
    typeof import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    typeof import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    typeof import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    typeof import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
    typeof import('@webcontainer/api')
  ];
  monaco = importResult[1];
  sandbox = importResult[0];
  editorWorker = importResult[2];
  jsonWorker = importResult[3];
  cssWorker = importResult[4];
  htmlWorker = importResult[5];
  tsWorker = importResult[6];
  const webcontainer = importResult[7].WebContainer;

  webcontainerInstance = await webcontainer.boot();

  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker.default();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker.default();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker.default();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker.default();
      }
      return new editorWorker.default();
    }
  };

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
}

type LibraryCode = { [key: string]: Record<string, string> };

type Props = {
  text: string;
  height?: number;
  width?: number;
  sidebarWidth?: string;
  libraries?: LibraryCode;
  dependencies?: Record<string, string>;
  customSidebar?: React.ReactNode;
  extraDts?: Record<string, string>;
};

const files = {
  'index.js': {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`
    }
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`
    }
  }
};

export default function Code(props: Props) {
  const id = useId();
  const height = props?.height || 300;
  const sb = useRef<ReturnType<(typeof sandbox)['createTypeScriptSandbox']> | null>(null);
  const divEl = useRef<HTMLDivElement>(null);
  const consoleOutput = useRef<HTMLDivElement>(null);
  const editor = useRef<TMonaco.editor.IStandaloneCodeEditor | null>(null);

  async function initWebContainer() {
    if (typeof webcontainerInstance !== 'undefined') {
      await webcontainerInstance.mount(files);
      const terminal = new Terminal({
        convertEol: true
      });

      if (consoleOutput.current) terminal.open(consoleOutput.current);

      const installProcess = await webcontainerInstance.spawn('npm', ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            terminal.write(chunk);
          }
        })
      );
    }
  }

  useEffect(() => {
    if (divEl.current) {
      const sandboxConfig = {
        text: props.text,
        compilerOptions: {},
        domID: id,
        acquireTypes: false
      } satisfies Parameters<(typeof sandbox)['createTypeScriptSandbox']>[0];
      const themeData = {
        base: 'vs',
        inherit: true,
        rules: [
          {
            foreground: 'b07b50',
            token: 'variable.parameter.function'
          },
          {
            foreground: 'ebddd2',
            token: 'comment'
          },
          {
            foreground: 'ebddd2',
            token: 'punctuation.definition.comment'
          },
          {
            foreground: 'b07b50',
            token: 'punctuation.definition.string'
          },
          {
            foreground: 'b07b50',
            token: 'punctuation.definition.variable'
          },
          {
            foreground: 'b07b50',
            token: 'punctuation.definition.parameters'
          },
          {
            foreground: 'b07b50',
            token: 'punctuation.definition.array'
          },
          {
            foreground: 'b07b50',
            token: 'none'
          },
          {
            foreground: 'b07b50',
            token: 'keyword.operator'
          },
          {
            foreground: 'd0b097',
            token: 'keyword'
          },
          {
            foreground: 'cdac92',
            token: 'variable'
          },
          {
            foreground: 'd4b8a1',
            token: 'entity.name.function'
          },
          {
            foreground: 'd4b8a1',
            token: 'meta.require'
          },
          {
            foreground: 'd4b8a1',
            token: 'support.function.any-method'
          },
          {
            foreground: 'bb8e6a',
            token: 'support.class'
          },
          {
            foreground: 'bb8e6a',
            token: 'entity.name.class'
          },
          {
            foreground: 'bb8e6a',
            token: 'entity.name.type.class'
          },
          {
            foreground: '924a10',
            token: 'meta.class'
          },
          {
            foreground: 'd4b8a1',
            token: 'keyword.other.special-method'
          },
          {
            foreground: 'd0b097',
            token: 'storage'
          },
          {
            foreground: 'c6a182',
            token: 'support.function'
          },
          {
            foreground: 'c29978',
            token: 'string'
          },
          {
            foreground: 'c29978',
            token: 'constant.other.symbol'
          },
          {
            foreground: 'c29978',
            token: 'entity.other.inherited-class'
          },
          {
            foreground: 'bf9471',
            token: 'constant.numeric'
          },
          {
            foreground: 'bf9471',
            token: 'none'
          },
          {
            foreground: 'bf9471',
            token: 'none'
          },
          {
            foreground: 'bf9471',
            token: 'constant'
          },
          {
            foreground: 'cdac92',
            token: 'entity.name.tag'
          },
          {
            foreground: 'bf9471',
            token: 'entity.other.attribute-name'
          },
          {
            foreground: 'd4b8a1',
            token: 'entity.other.attribute-name.id'
          },
          {
            foreground: 'd4b8a1',
            token: 'punctuation.definition.entity'
          },
          {
            foreground: 'd0b097',
            token: 'meta.selector'
          },
          {
            foreground: 'bf9471',
            token: 'none'
          },
          {
            foreground: 'd4b8a1',
            token: 'markup.heading punctuation.definition.heading'
          },
          {
            foreground: 'd4b8a1',
            token: 'entity.name.section'
          },
          {
            foreground: 'bf9471',
            token: 'keyword.other.unit'
          },
          {
            foreground: 'bb8e6a',
            fontStyle: 'bold',
            token: 'markup.bold'
          },
          {
            foreground: 'bb8e6a',
            fontStyle: 'bold',
            token: 'punctuation.definition.bold'
          },
          {
            foreground: 'd0b097',
            fontStyle: 'italic',
            token: 'markup.italic'
          },
          {
            foreground: 'd0b097',
            fontStyle: 'italic',
            token: 'punctuation.definition.italic'
          },
          {
            foreground: 'c29978',
            token: 'markup.raw.inline'
          },
          {
            foreground: 'cdac92',
            token: 'string.other.link'
          },
          {
            foreground: 'cdac92',
            token: 'punctuation.definition.string.end.markdown'
          },
          {
            foreground: 'bf9471',
            token: 'meta.link'
          },
          {
            foreground: 'cdac92',
            token: 'markup.list'
          },
          {
            foreground: 'bf9471',
            token: 'markup.quote'
          },
          {
            foreground: 'b07b50',
            token: 'meta.separator'
          },
          {
            foreground: 'c29978',
            token: 'markup.inserted'
          },
          {
            foreground: 'cdac92',
            token: 'markup.deleted'
          },
          {
            foreground: 'd0b097',
            token: 'markup.changed'
          },
          {
            foreground: 'c6a182',
            token: 'constant.other.color'
          },
          {
            foreground: 'c6a182',
            token: 'string.regexp'
          },
          {
            foreground: 'c6a182',
            token: 'constant.character.escape'
          },
          {
            foreground: 'd0b097',
            token: 'punctuation.section.embedded'
          },
          {
            foreground: 'd0b097',
            token: 'variable.interpolation'
          },
          {
            foreground: '924a10',
            token: 'invalid.illegal'
          },
          {
            foreground: 'ffffff',
            token: 'invalid.broken'
          },
          {
            foreground: '924a10',
            token: 'invalid.deprecated'
          },
          {
            foreground: '924a10',
            token: 'invalid.unimplemented'
          }
        ],
        colors: {
          'editor.foreground': '#b07b50',
          'editor.background': '#ffffff',
          'editor.selectionBackground': '#f8f4f0',
          'editor.lineHighlightBackground': '#fcfaf9',
          'editorCursor.foreground': '#b07b50',
          'editorWhitespace.foreground': '#f3ece6'
        }
      } satisfies import('monaco-editor').editor.IStandaloneThemeData;
      monaco.editor.defineTheme('default', themeData);
      sb.current = sandbox.createTypeScriptSandbox(sandboxConfig, monaco, typescript);
      sb.current.monaco.editor.setTheme('default');
      sb.current.editor.updateOptions({
        lineNumbers: 'off',
        automaticLayout: true,
        'semanticHighlighting.enabled': true,
        minimap: { enabled: false },
        overviewRulerLanes: 0,
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden',
          handleMouseWheel: false
        }
      });

      Object.entries(props.libraries || {}).forEach(([libName, dtss]) => {
        Object.entries(dtss).forEach(([path, dts]) => {
          path = `file:///node_modules/${libName}/${path}`;
          sb.current?.languageServiceDefaults.addExtraLib(dts, path);
        });
      });

      for (const [fileName, content] of Object.entries(props.extraDts || {})) {
        sb.current?.languageServiceDefaults.addExtraLib(content, `file:///${fileName}`);
      }
    }

    initWebContainer();

    return () => {
      editor.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (divEl.current && sb.current) {
      sb.current.editor.setValue(props.text);
    }
  }, [props.text]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-row items-center justify-center w-full h-full shadow-[10px_35px_60px_10px_rgba(60,60,60,0.5)]">
        {props?.customSidebar}
        <div
          className={`flex flex-row w-[100vw] h-[${height}px] relative shadow-[10px_35px_60px_10px_rgba(60,60,60,0.5)]`}
          style={{
            boxShadow:
              '0px 4px 16px rgba(17,17,26,0.1), 0px 8px 24px rgba(17,17,26,0.1), 0px 16px 56px rgba(17,17,26,0.1);'
          }}
        >
          <div
            ref={divEl}
            id={id}
            className="shadow-md"
            style={{
              height,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: props.width || 720
            }}
          />
        </div>
      </div>
      <div
        ref={consoleOutput}
        className="flex flex-col items-center justify-center"
        style={{
          height: 240,
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: `calc(${props.width || 720}px + ${props.sidebarWidth || '0px'})`
        }}
      ></div>
    </div>
  );
}
