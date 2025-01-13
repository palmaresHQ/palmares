import '@xterm/xterm/css/xterm.css';

import { useRef, useEffect, useId, useMemo, useState } from 'react';
import type * as TMonaco from 'monaco-editor';
import typescript from 'typescript';

import { getEditor, monacoEditorRules, monacoEditorColors } from '../utils';

type LibraryCode = { [key: string]: Record<string, string> };

type Props = {
  text: string;
  height?: number;
  width?: number;
  sidebarWidth?: string;
  libraries?: LibraryCode;
  dependencies?: Record<string, string>;
  customSidebar?: React.ReactNode;
  commands: { command: string; tag?: string; shouldExit?: boolean }[];
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
  const sb = useRef<ReturnType<Awaited<ReturnType<typeof getEditor>>['sandbox']['createTypeScriptSandbox']> | null>(
    null
  );
  const divEl = useRef<HTMLDivElement>(null);
  const editor = useRef<TMonaco.editor.IStandaloneCodeEditor | null>(null);
  const terminalTags = useMemo<string[]>(() => {
    const reducedCommandTags = props.commands.reduce((accumulator, currentValue) => {
      if (accumulator.has(currentValue.tag)) return accumulator;
      accumulator.add(currentValue.tag);
      return accumulator;
    }, new Set());
    if (reducedCommandTags.size === 0) return ['default'];
    return Array.from(reducedCommandTags) as string[];
  }, [props.commands]);
  const terminalsRef = useRef<Record<string, HTMLDivElement | null>>(
    terminalTags.reduce(
      (acc, tag) => {
        acc[tag] = null;
        return acc;
      },
      {} as Record<string, HTMLDivElement | null>
    ) as Record<string, HTMLDivElement | null>
  );
  const [activeTag, setActiveTag] = useState<string>(terminalTags[0]);

  async function initWebContainer(args: Awaited<ReturnType<typeof getEditor>>) {
    if (typeof args.webcontainerInstance !== 'undefined') {
      await args.webcontainerInstance.mount(files);

      const organizeCommands = props.commands.reduce(
        (acc, currentValue) => {
          const commandData = {
            shouldExit: typeof currentValue.shouldExit === 'boolean' ? currentValue.shouldExit : true,
            command: currentValue.command
          };
          if (acc[currentValue.tag || 'default']) acc[currentValue.tag || 'default'].push(commandData);
          else acc[currentValue.tag || 'default'] = [commandData];
          return acc;
        },
        {} as Record<string, { shouldExit?: boolean; command: string }[]>
      );

      for (const [tag, commands] of Object.entries(organizeCommands)) {
        const commandOutput = terminalsRef.current[tag || 'default'];

        console.log(tag, commandOutput);
        if (!commandOutput) continue;
        const terminal = new args.Terminal({
          convertEol: true,
          fontSize: 10,
          fontFamily: 'monospace',
          theme: {
            foreground: '#EEEEEE',
            background: 'rgba(0, 0, 0, 0.0)',
            cursor: '#CFF5DB'
          }
        });

        const fitAddon = new args.FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(commandOutput);
        fitAddon.fit();

        for (const command of commands) {
          const actualCommandToRun = command.command.split(' ');
          const commandToRun = actualCommandToRun.shift() as string;

          const process = await args.webcontainerInstance.spawn(commandToRun, actualCommandToRun);
          process.output.pipeTo(
            new WritableStream({
              write(chunk) {
                terminal.write(chunk);
              }
            })
          );
          if (command.shouldExit) await process.exit;
        }
      }
    }
  }

  useEffect(() => {
    if (divEl.current) {
      getEditor().then(
        ({
          sandbox,
          monaco,
          editorWorker,
          jsonWorker,
          cssWorker,
          htmlWorker,
          tsWorker,
          Terminal,
          FitAddon,
          webcontainerInstance
        }) => {
          const sandboxConfig = {
            text: props.text,
            compilerOptions: {},
            domID: id,
            acquireTypes: false
          } satisfies Parameters<Awaited<ReturnType<typeof getEditor>>['sandbox']['createTypeScriptSandbox']>[0];
          const themeData = {
            base: 'vs',
            inherit: true,
            rules: monacoEditorRules,
            colors: monacoEditorColors
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

          initWebContainer({
            sandbox,
            monaco,
            editorWorker,
            jsonWorker,
            cssWorker,
            htmlWorker,
            tsWorker,
            Terminal,
            FitAddon,
            webcontainerInstance
          });
        }
      );
    }

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
              '0px 4px 16px rgba(17,17,26,0.1), 0px 8px 24px rgba(17,17,26,0.1), 0px 16px 56px rgba(17,17,26,0.1)'
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

      {terminalTags.length > 1 ? (
        <div
          className="flex flex-center items-start justify-start h-24 w-full bg-primary-100"
          style={{
            width: `calc(${props.width || 720}px + ${props.sidebarWidth || '0px'})`
          }}
        >
          {terminalTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex flex-row items-center justify-center`}
              style={{
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
                backgroundColor: tag === activeTag ? 'rgba(1,1,1,0.2)' : 'transparent',
                boxShadow:
                  tag === activeTag
                    ? '0px 4px 16px rgba(17,17,26,0.1), 0px 8px 24px rgba(17,17,26,0.1), 0px 16px 56px rgba(17,17,26,0.1)'
                    : undefined
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
      {terminalTags.map((tag) => (
        <div
          key={tag}
          ref={(el) => {
            terminalsRef.current[tag] = el;
          }}
          className="flex flex-col items-center justify-center terminal"
          style={{
            display: tag === activeTag ? 'block' : 'none',
            height: 240,
            backgroundColor: 'rgba(0,0,0,0.8)',
            width: `calc(${props.width || 720}px + ${props.sidebarWidth || '0px'})`
          }}
        />
      ))}
    </div>
  );
}
