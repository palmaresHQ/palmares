import { useRef, useEffect } from 'react';
import type * as TMonaco from 'monaco-editor';
import typescript from 'typescript';

let sandbox: typeof import('@typescript/sandbox');
let monaco: typeof import('monaco-editor');
let editorWorker: typeof import('monaco-editor/esm/vs/editor/editor.worker?worker');
let jsonWorker: typeof import('monaco-editor/esm/vs/language/json/json.worker?worker');
let cssWorker: typeof import('monaco-editor/esm/vs/language/css/css.worker?worker');
let htmlWorker: typeof import('monaco-editor/esm/vs/language/html/html.worker?worker');
let tsWorker: typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');

if (typeof self !== 'undefined') {
  const importResult = await Promise.all([
    import('@typescript/sandbox'),
    import('monaco-editor'),
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
  ]) as [typeof import('@typescript/sandbox'), typeof import('monaco-editor'), typeof import('monaco-editor/esm/vs/editor/editor.worker?worker'), typeof import('monaco-editor/esm/vs/language/json/json.worker?worker'), typeof import('monaco-editor/esm/vs/language/css/css.worker?worker'), typeof import('monaco-editor/esm/vs/language/html/html.worker?worker'), typeof import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')];
  monaco = importResult[1];
  sandbox = importResult[0];
  editorWorker = importResult[2];
  jsonWorker = importResult[3];
  cssWorker = importResult[4];
  htmlWorker = importResult[5];
  tsWorker = importResult[6];
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


type Props = {
  height?: number;
}
export default function Code(props: Props) {
  const height = props?.height || 300;
	const divEl = useRef<HTMLDivElement>(null);
  const editor = useRef<TMonaco.editor.IStandaloneCodeEditor | null>(null);

	useEffect(() => {
    if (divEl.current) {
      const initialCode = `import {markdown, danger} from "danger"

export default async function () {
    // Check for new @types in devDependencies
    const packageJSONDiff = await danger.git.JSONDiffForFile("package.json")
    const newDeps = packageJSONDiff.devDependencies.added
    const newTypesDeps = newDeps?.filter(d => d.includes("@types")) ?? []
    if (newTypesDeps.length){
        markdown("Added new types packages " + newTypesDeps.join(", "))
    }
}

const a = {
  b: 1
}
`
      const sandboxConfig = {
        text: initialCode,
        compilerOptions: {},
        domID: "monaco-editor-embed",
      }
      sandbox.createTypeScriptSandbox(sandboxConfig, monaco, typescript);

    }
		return () => {
			editor.current?.dispose();
		};
	}, []);

	return (
    <div className='flex flex-col w-full min-h-[580px] relative'>
      <div ref={divEl} id="monaco-editor-embed" style={{ height }}/>
    </div>
  );
};
