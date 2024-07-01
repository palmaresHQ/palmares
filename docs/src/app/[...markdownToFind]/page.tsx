import { UseMdxComponents, compile } from '@mdx-js/mdx';
import fs from 'fs';
import path from 'path';

import Test from '../../components/Test';
import { useMDXComponents } from '../../hooks';
import Sidebar from '@/components/Sidebar';

const imports = {
  Test,
  useMDXComponents,
};

const AsyncFunction = async function () {}.constructor;

export default async function Docs(props: { params: { markdownToFind: string[] } }) {
  const rootDir = path.join(process.cwd(), '..', 'packages', props.params.markdownToFind[0], 'docs');
  const routes = fs.readFileSync(path.join(rootDir, 'routes.json'), 'utf-8');
  const result = await compile(fs.readFileSync(path.join(rootDir, `${props.params.markdownToFind[1]}.mdx`), 'utf-8'), {
    providerImportSource: '../../insertComponents',
  });

  const getCompiledComponent = AsyncFunction(
    'imports',
    (result.value as string)
      .replace('export default function MDXContent', 'return function MDXContent')
      .replace(/import ({[\w\_\-\d\,\s]+}) from (\'|")([\w\_\-\d\/\.\@]+)(\'|");/g, (_match, p1, _, p2) => {
        if (p2.includes('../') || p2.includes('@')) return `const ${p1.replaceAll(' as ', ': ')} = imports;`;
        return `const ${p1.replaceAll(' as ', ': ')} = await import ("${p2
          .replace('../', path.join(process.cwd(), 'src') + '/')
          .replaceAll('../', '')}");`;
      })
  ) as (imports: Record<string, (() => JSX.Element) | UseMdxComponents>) => Promise<() => JSX.Element>;

  const CompiledComponent = await getCompiledComponent(imports);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-row justify-stretch w-full">
        <div className="flex">
          <Sidebar route={JSON.parse(routes)} />
        </div>
        <div className="flex flex-col w-full p-2">
          <CompiledComponent />
        </div>
      </div>
    </main>
  );
}
