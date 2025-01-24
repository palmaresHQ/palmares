import '@xterm/xterm/css/xterm.css';

import { useRef, useEffect, useId, useMemo, useState } from 'react';
import type * as TMonaco from 'monaco-editor';
import typescript from 'typescript';

import { getEditor, monacoEditorRules, monacoEditorColors } from '../utils';

import type { FileSystemTree } from '@webcontainer/api';

type LibraryCode = { [key: string]: Record<string, string> };

type Props = {
  text: string;
  height?: number;
  width?: number;
  sidebarWidth?: string;
  libraries?: Record<
    string,
    {
      raw: LibraryCode[string];
      formatted: FileSystemTree;
    }
  >;
  customSidebar?: React.ReactNode;
  commands: { command: string; tag?: string; shouldExit?: boolean; show?: boolean }[];
  extraDts?: Record<string, string>;
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
      // const parsedExtraDts = Object.entries(props.extraDts || {}).reduce((accumulator, currentValue) => {
      //   const [key, value] = currentValue;
      //   const splittedPath = key.split('/');
      //   let data = accumulator;
      //   for (let i = 0; i < splittedPath.length; i++) {
      //     const isLastPath = i === splittedPath.length - 1;
      //     if (isLastPath === false) {
      //       if (data[splittedPath[i]] === undefined)
      //         data[splittedPath[i]] = {
      //           directory: {}
      //         };
      //       data = (data[splittedPath[i]] as any).directory as FileSystemTree;
      //       continue;
      //     } else {
      //       data[splittedPath[i]] = {
      //         file: {
      //           contents: value
      //         }
      //       };
      //     }
      //   }
      //
      //   return accumulator;
      // }, {} as FileSystemTree);
      const formattedLibraries = Object.entries(props.libraries || {}).reduce((acc, [key, currentValue]) => {
        if (acc['packages'] === undefined)
          acc['packages'] = {
            directory: {}
          };
        if (acc['apps'] === undefined)
          acc['apps'] = {
            directory: {}
          };

        if (key.startsWith('@palmares/')) {
          const keyWithoutPalmares = key.replace('@palmares/', '');
          (acc['packages'] as any)['directory'][keyWithoutPalmares] = {
            directory: currentValue.formatted
          };
        } else {
          (acc['apps'] as any)['directory'][key] = {
            directory: currentValue.formatted
          };
        }

        return acc;
      }, {} as FileSystemTree);

      formattedLibraries['package.json'] = {
        file: {
          contents: JSON.stringify(
            {
              name: 'palmares-app',
              version: '0.0.0',
              private: true,
              type: 'module',
              workspaces: ['apps/**/*', 'packages/**/*']
            },
            null,
            2
          )
        }
      };
      await args.webcontainerInstance.mount(formattedLibraries);

      const commandOutput = terminalsRef.current['Install'];
      if (!commandOutput) return;
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

      const shellProcess = await args.webcontainerInstance.spawn('jsh');
      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          }
        })
      );
      const input = shellProcess.input.getWriter();
      terminal.onData((data) => {
        input.write(data);
      });

      //
      // const organizeCommands = props.commands.reduce(
      //   (acc, currentValue) => {
      //     const commandData = {
      //       shouldExit: typeof currentValue.shouldExit === 'boolean' ? currentValue.shouldExit : true,
      //       command: currentValue.command,
      //       show: typeof currentValue.show === 'boolean' ? currentValue.show : true
      //     };
      //     if (acc[currentValue.tag || 'default']) acc[currentValue.tag || 'default'].push(commandData);
      //     else acc[currentValue.tag || 'default'] = [commandData];
      //     return acc;
      //   },
      //   {} as Record<string, { shouldExit?: boolean; command: string; show?: boolean }[]>
      // );
      //
      // for (const [tag, commands] of Object.entries(organizeCommands)) {
      //   const commandOutput = terminalsRef.current[tag || 'default'];
      //
      //   if (!commandOutput) continue;
      //   const terminal = new args.Terminal({
      //     convertEol: true,
      //     fontSize: 10,
      //     fontFamily: 'monospace',
      //     theme: {
      //       foreground: '#EEEEEE',
      //       background: 'rgba(0, 0, 0, 0.0)',
      //       cursor: '#CFF5DB'
      //     }
      //   });
      //
      //   const fitAddon = new args.FitAddon();
      //   terminal.loadAddon(fitAddon);
      //   terminal.open(commandOutput);
      //   fitAddon.fit();
      //
      //   for (const command of commands) {
      //     const actualCommandToRun = command.command.split(' ');
      //     const commandToRun = actualCommandToRun.shift() as string;
      //
      //     const process = await args.webcontainerInstance.spawn(commandToRun, actualCommandToRun);
      //     if (command.show !== false)
      //       process.output.pipeTo(
      //         new WritableStream({
      //           write(chunk) {
      //             terminal.write(chunk);
      //           }
      //         })
      //       );
      //
      //     if (command.shouldExit) await process.exit;
      //   }
      // }
    }
  }

  useEffect(() => {
    const shouldLoadMonaco =
      divEl.current && Object.keys(props.extraDts || {}).length > 0 && Object.keys(props.libraries || {}).length > 0;

    if (shouldLoadMonaco) {
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
            automaticLayout: false,

            'semanticHighlighting.enabled': true,
            minimap: { enabled: false },
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden',
              handleMouseWheel: false
            },
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0
          });
          Object.entries(props.libraries || {}).forEach(([libName, dtss]) => {
            Object.entries(dtss.raw).forEach(([path, dts]) => {
              path = `file:///node_modules/${libName}/${path}`;
              sb.current?.languageServiceDefaults.addExtraLib(dts, path);
            });
          });

          sb.current.editor.onDidChangeModelContent((e) => {
            console.log(sb.current?.getModel());
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
            backgroundColor: '#ffffff',
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
                backgroundColor: tag === activeTag ? '#ffffff' : 'transparent',
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
            height: 240,
            display: tag === activeTag ? 'flex' : 'none',
            backgroundColor: 'rgba(0,0,0,0.8)',
            width: `calc(${props.width || 720}px + ${props.sidebarWidth || '0px'})`
          }}
        />
      ))}
    </div>
  );
}
