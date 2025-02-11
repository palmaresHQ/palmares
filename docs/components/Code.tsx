import '@xterm/xterm/css/xterm.css';

import { useRef, useEffect, useId, useMemo, useState, Fragment } from 'react';
import typescript from 'typescript';

import { getEditor, monacoEditorRules, monacoEditorColors } from '../utils';

import { useServerFn } from '@tanstack/start';
import { getAllLibraryCodes, GetLibraryCodesFn } from '../server/get-code';

import type * as TMonaco from 'monaco-editor';
import type { FileSystemTree } from '@webcontainer/api';
import type { Terminal } from '@xterm/xterm';
import { isChromium } from '../utils/is-chromium';

type LibraryCode = { [key: string]: Record<string, string> };

let getAllLibraryCodesPromise: ReturnType<GetLibraryCodesFn>;

type Props = {
  text: string;
  height?: number;
  width?: number;
  sidebarWidth?: string;
  isChromium?: boolean;
  libraries?: Record<
    string,
    {
      raw: LibraryCode[string];
      formatted: FileSystemTree;
    }
  >;
  customSidebar?: React.ReactNode;
  commands: {
    command: string;
    serverReady?: (url: string, port: number, terminal: Terminal) => Promise<void>;
    tag?: string;
    shouldExit?: boolean;
    show?: boolean;
  }[];
  extraDts?: Record<string, string>;
};

export default function Code(props: Props) {
  const id = useId();
  const height = props?.height || 300;
  const sb = useRef<ReturnType<Awaited<ReturnType<typeof getEditor>>['sandbox']['createTypeScriptSandbox']> | null>(
    null
  );
  const getLibraryCodeFn = useServerFn(getAllLibraryCodes);

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
  const terminalsRef = useRef<
    Record<
      string,
      {
        terminal: null | Terminal;
        container: HTMLDivElement | null;
      }
    >
  >(
    terminalTags.reduce(
      (acc, tag) => {
        acc[tag] = {
          terminal: null,
          container: null
        };
        return acc;
      },
      {} as Record<
        string,
        {
          terminal: null | Terminal;
          container: HTMLDivElement | null;
        }
      >
    ) as Record<
      string,
      {
        terminal: null | Terminal;
        container: HTMLDivElement | null;
      }
    >
  );
  const [activeTag, setActiveTag] = useState<string>(terminalTags[0]);

  async function initWebContainer(
    args: Awaited<ReturnType<typeof getEditor>>,
    libraries: Awaited<ReturnType<GetLibraryCodesFn>>
  ) {
    console.log('heeere', args.webcontainerInstance);
    if (typeof args.webcontainerInstance !== 'undefined') {
      const mergedLibrariesWithAppsCode = {
        ...props.libraries,
        ...libraries
      } as Awaited<ReturnType<GetLibraryCodesFn>>;
      const formattedLibraries = Object.entries(mergedLibrariesWithAppsCode).reduce((acc, [key, currentValue]) => {
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
      const commandOutput = terminalsRef.current['Dev Server'];
      if (!commandOutput?.container) return;

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

      commandOutput.terminal = terminal;
      const fitAddon = new args.FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(commandOutput.container);
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

      // for (const command of props.commands || []) {
      //   const tag = command.tag || 'default';
      //   const commandOutput = terminalsRef.current[tag];
      //
      //   if (!commandOutput?.container) continue;
      //   if (!commandOutput.terminal) {
      //     const terminal = new args.Terminal({
      //       convertEol: true,
      //       fontSize: 10,
      //       fontFamily: 'monospace',
      //       theme: {
      //         foreground: '#EEEEEE',
      //         background: 'rgba(0, 0, 0, 0.0)',
      //         cursor: '#CFF5DB'
      //       }
      //     });
      //
      //     commandOutput.terminal = terminal;
      //     const fitAddon = new args.FitAddon();
      //     terminal.loadAddon(fitAddon);
      //     terminal.open(commandOutput.container);
      //     fitAddon.fit();
      //   }
      //
      //   const actualCommandToRun = command.command.split(' ');
      //   const commandToRun = actualCommandToRun.shift() as string;
      //
      //   const process = await args.webcontainerInstance.spawn(commandToRun, actualCommandToRun);
      //   if (command.show !== false)
      //     process.output.pipeTo(
      //       new WritableStream({
      //         write(chunk) {
      //           commandOutput.terminal?.write(chunk);
      //         }
      //       })
      //     );
      //
      //   if (command.serverReady) {
      //     args.webcontainerInstance.on('server-ready', (port, url) => {
      //       if (command?.serverReady === undefined) return;
      //       if (!commandOutput?.terminal) return;
      //       command?.serverReady?.(url, port, commandOutput.terminal);
      //     });
      //   }
      //
      //   if (command.shouldExit) await process.exit;
      // }
    }
  }

  function loadLibrariesAndAppCode() {
    if (getAllLibraryCodesPromise) {
      getAllLibraryCodesPromise.then((data) => {
        Object.entries(data).forEach(([libName, dtss]) => {
          Object.entries(dtss.raw).forEach(([path, dts]) => {
            path = `file:///node_modules/${libName}/${path}`;
            sb.current?.languageServiceDefaults.addExtraLib(dts, path);
          });
        });
        for (const [fileName, content] of Object.entries(props.extraDts || {})) {
          sb.current?.languageServiceDefaults.addExtraLib(content, `file:///${fileName}`);
        }
      });
    }
  }

  useEffect(() => {
    const shouldLoadMonaco =
      divEl.current && Object.keys(props.extraDts || {}).length > 0 && Object.keys(props.libraries || {}).length > 0;

    if (shouldLoadMonaco && typeof window !== 'undefined') {
      getEditor().then(({ sandbox, monaco }) => {
        const sandboxConfig = {
          text: props.text,
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
          scrollBeyondLastLine: false
        });

        loadLibrariesAndAppCode();
      });
    }

    return () => {
      editor.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!getAllLibraryCodesPromise) getAllLibraryCodesPromise = getLibraryCodeFn();

    getAllLibraryCodesPromise.then((data) => {
      loadLibrariesAndAppCode();
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
          if (webcontainerInstance) {
            initWebContainer(
              {
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
              },
              data
            );
          }
        }
      );
    });
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
      {(typeof props.isChromium !== 'undefined' ? props.isChromium : isChromium()) ? (
        <Fragment>
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
                terminalsRef.current[tag].container = el;
              }}
              className="flex flex-col items-center justify-center overflow-hidden terminal"
              style={{
                height: 240,
                display: tag === activeTag ? 'flex' : 'none',
                backgroundColor: 'rgba(0,0,0,0.8)',
                width: `calc(${props.width || 720}px + ${props.sidebarWidth || '0px'})`
              }}
            />
          ))}
        </Fragment>
      ) : null}
    </div>
  );
}
