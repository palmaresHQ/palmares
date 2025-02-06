import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Fragment, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';

import Code from '../../components/Code';

import type { FileSystemTree } from '@webcontainer/api';

type LibraryCode = { [key: string]: Record<string, string> };

async function getLibraryCodes(
  libraries: [string, string][],
  parser: ((args: { path: string; content: string }) => { path: string; content: string }) | undefined = undefined
): Promise<
  Record<
    string,
    {
      raw: LibraryCode[string];
      formatted: FileSystemTree;
    }
  >
> {
  let libraryCodes = {} as Record<
    string,
    {
      raw: LibraryCode[string];
      formatted: FileSystemTree;
    }
  >;

  async function getFiles(
    dir: string,
    rootDir = dir,
    files = {
      raw: {} as LibraryCode[string],
      formatted: {} as FileSystemTree
    },
    filesOrFoldersToConsider = undefined as string[] | undefined,
    hasFoundPackageJson = false
  ) {
    const fileList = await fs.readdir(dir);
    if (hasFoundPackageJson === false) {
      for (const file of fileList) {
        if (file.endsWith('package.json')) {
          hasFoundPackageJson = true;
          const packageJsonContents = await fs.readFile(path.join(dir, file), 'utf8');
          const packageJson = JSON.parse(packageJsonContents);

          if (packageJson.files) {
            files.raw['package.json'] = packageJsonContents as any;
            files.formatted['package.json'] = {
              file: {
                contents: packageJsonContents as any
              }
            };
            return getFiles(dir, rootDir, files, packageJson.files, true);
          }
          break;
        }
      }
    } else {
      await Promise.all(
        fileList.map(async (file) => {
          const filePath = path.join(dir, file);
          if (Array.isArray(filesOrFoldersToConsider) && filesOrFoldersToConsider.includes(file) === false) return;
          if ((await fs.stat(filePath)).isDirectory())
            return getFiles(filePath, rootDir, files, undefined, hasFoundPackageJson);
          else {
            let filePathRelativeToRoot = path.relative(rootDir, filePath);
            let fileContent = await fs.readFile(filePath, 'utf8');
            if (parser) {
              const parsed = parser({ path: filePathRelativeToRoot, content: fileContent });
              filePathRelativeToRoot = parsed.path;
              fileContent = parsed.content;
            }

            files.raw[filePathRelativeToRoot] = fileContent;
            const splittedPath = filePathRelativeToRoot.split('/');

            let data = files.formatted;
            for (let i = 0; i < splittedPath.length; i++) {
              const isLastPath = i === splittedPath.length - 1;
              const fileOrFolder = splittedPath[i];
              if (isLastPath === false) {
                if (data[fileOrFolder] === undefined)
                  data[fileOrFolder] = {
                    directory: {}
                  };
                data = (data[fileOrFolder] as any).directory as FileSystemTree;
                continue;
              } else
                data[splittedPath[i]] = {
                  file: {
                    contents: fileContent
                  }
                };
            }
          }
        })
      );
    }
  }
  await Promise.all(
    libraries.map(async ([library, path]) => {
      libraryCodes[library] = {
        raw: {} as LibraryCode[string],
        formatted: {} as FileSystemTree
      } as {
        raw: LibraryCode[string];
        formatted: FileSystemTree;
      };
      await getFiles(path, path, libraryCodes[library]);
    })
  );
  for (const values of Object.values(libraryCodes)) {
    const packageJsonOfLibrary = values.raw['package.json'];
    const packageJsonFormatted = JSON.parse(packageJsonOfLibrary);
    for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (!packageJsonFormatted[type]) continue;
      for (const [key, value] of Object.entries(packageJsonFormatted[type])) {
        if (value === 'workspace:*') {
          const packageJsonOfDependency = JSON.parse(libraryCodes[key].raw['package.json']);
          packageJsonFormatted[type][key] = packageJsonOfDependency.version;
        }
      }
    }
    const stringfiedPackageJson = JSON.stringify(packageJsonFormatted, null, 2);
    values.raw['package.json'] = stringfiedPackageJson;
    if ((values?.formatted?.['package.json'] as any)?.file?.contents)
      (values.formatted['package.json'] as any)['file']['contents'] = stringfiedPackageJson;
  }

  return libraryCodes;
}

const getAllLibraryCodes = createServerFn({ method: 'GET' })
  .validator((data: [string, string][]) => (Array.isArray(data) ? data : undefined))
  .handler(async (ctx) => {
    const libraryCodes = await getLibraryCodes(
      (ctx.data || []).concat([
        ['@palmares/console-logging', '../libs/console-logging'],
        ['@palmares/drizzle-engine', '../libs/drizzle-engine'],
        ['@palmares/express-adapter', '../libs/express-adapter'],
        ['@palmares/jest-tests', '../libs/jest-tests'],
        ['@palmares/node-std', '../libs/node-std'],
        ['@palmares/sequelize-engine', '../libs/sequelize-engine'],
        ['@palmares/zod-schema', '../libs/zod-schema'],
        ['@palmares/core', '../packages/core'],
        ['@palmares/databases', '../packages/databases'],
        ['@palmares/schemas', '../packages/schemas'],
        ['@palmares/server', '../packages/server'],
        ['@palmares/tests', '../packages/tests'],
        ['@palmares/logging', '../packages/logging'],
        ['@palmares/events', '../packages/events']
      ]),
      ({ path, content }) => {
        return {
          path: path.replace('_', ''),
          content: content.startsWith('// @ts-nocheck\n') ? content.replace('// @ts-nocheck\n', '') : content
        };
      }
    );
    return libraryCodes as any;
  });

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => ({
    data: await getAllLibraryCodes({
      data: [['mainpage', './examples/mainpage']]
    })
  })
});

function Home() {
  const [selectedCode, setSelectedCode] = useState<string>('src/core/database.ts');
  const { data } = Route.useLoaderData();

  const codeFiles = (data as Awaited<ReturnType<typeof getLibraryCodes>>)['mainpage'];
  const sidebarFiles = Object.keys(codeFiles?.raw || {})
    .filter(
      (code) =>
        code.endsWith('database.ts') ||
        code.endsWith('schemas.ts') ||
        code.endsWith('tests.ts') ||
        code.endsWith('server.ts')
    )
    .sort();

  return (
    <div className="flex flex-col bg-[#ffffff]">
      <nav className="flex flex-row justify-center items-center w-full mt-24 mb-24">
        <div className="flex flex-row justify-evenly w-96">
          <a className="text-tertiary-950">blog</a>
          <p className="text-primary-500 select-none">/</p>
          <a className="text-tertiary-950">about</a>
          <p className="text-primary-500 select-none">/</p>
          <a className="text-tertiary-950">docs</a>
        </div>
      </nav>
      <div className="flex flex-col justify-center items-center mb-12">
        <h3 className="text-2xl font-thin text-primary-600">A Javascript and Typescript framework for unification.</h3>
      </div>
      <div className="flex flex-col justify-center items-center h-[1px] w-full">
        <div className="h-full w-24 bg-primary-400"></div>
      </div>
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-12">
        <h1 className="text-8xl font-black text-tertiary-900">palmares.</h1>
        <div className="flex w-48 h-48">
          <img src="/Palmares.png" alt="logo" className="w-full h-full" />
        </div>
        <button
          type="button"
          className={`p-2 flex flex-col items-center justify-center  text-primary-600 font-light hover:text-tertiary-950 hover:font-normal hover:transition-all relative`}
        >
          <div className="p-2 h-full w-full absolute bg-transparent border-[1px] border-primary-300" />
          <div className="top-4 right-0 h-5 w-full absolute bg-transparent border-l-[1px] border-r-[1px] border-[#ffffff]" />
          <div className="top-0 right-11/12 h-full w-11/12 absolute bg-transparent border-b-[1px] border-t-[1px] border-[#ffffff]" />
          <p className="text-4xl">npx palmares@latest new app</p>
        </button>
      </div>
      <div className="flex flex-col justify-center items-center h-[1px] w-full">
        <div className="h-full w-24 bg-primary-400"></div>
      </div>
      <div className="flex flex-col justify-center items-center mt-12 mb-12 text-justify">
        <div className="flex flex-col max-w-2xl">
          <p className="font-thin">
            Palmares is a framework that aims for unification and freedom. It's opinionated at the same time it's not.
            Bring your own tools, forget thinking if X works with Y. With Palmares it just works! You can use it even
            without a server!
          </p>
          <p className="font-thin mt-2">
            You can also strip the hole framework apart and just use what you need from it on your projects. You don't
            need to use Palmares to use Palmares!
          </p>
          <p className="font-thin mt-2">
            It's aimed to work well on monorepos and have ZERO dependencies at it's core. Where javascript runs, this
            framework is supposed to run as well. Even on places where javascript is definitely the worst language
            choice!
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center h-[1px] w-full">
        <div className="h-full w-24 bg-primary-400"></div>
      </div>
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-12">
        <h1 className="text-5xl font-bold text-primary-600 text-center">
          All you need,
          <span
            className="to-tertiary-500 from-tertiary-800 bg-gradient-to-r bg-clip-text inline-block ml-2 pt-2 pb-2"
            style={{
              color: 'transparent'
            }}
          >
            fully typed
          </span>
        </h1>
      </div>
      <Code
        height={860}
        width={680}
        text={codeFiles?.raw[selectedCode]}
        extraDts={codeFiles?.raw}
        libraries={data as Awaited<ReturnType<typeof getLibraryCodes>>}
        sidebarWidth={'9rem'}
        commands={[
          {
            command: 'npm install',
            tag: 'Dev Server',
            shouldExit: true
          },
          {
            command: 'npm run setup -w mainpage',
            tag: 'Dev Server',
            shouldExit: true
          },
          {
            command: 'npm run test -w mainpage',
            tag: 'Dev Server',
            shouldExit: true
          }
        ]}
        customSidebar={
          <div className="flex flex-col w-36 h-[860px] from-tertiary-500 to-white bg-gradient-to-b p-2">
            {sidebarFiles.map((code, index) => (
              <Fragment key={code}>
                <button
                  type={'button'}
                  onClick={() => setSelectedCode(code)}
                  className={`flex flex-row items-center justify-between p-2 w-full text-left ${selectedCode === code ? 'bg-tertiary-200' : 'bg-transparent'} font-light text-sm rounded-md`}
                >
                  {code.replace('src/core/', '')}
                  {selectedCode === code ? (
                    <div className="flex flex-col w-[24px] max-h-[24px]">
                      <svg className="w-full h-full" viewBox="0 0 50 50">
                        <line className="stroke-primary-600" x1={35} y1={10} x2={40} y2={25} strokeWidth={2} />
                        <line className="stroke-primary-600" x1={40} y1={25} x2={35} y2={40} strokeWidth={2} />
                      </svg>
                    </div>
                  ) : null}
                </button>
                {index === sidebarFiles.length - 1 ? null : (
                  <div className="h-[2px] w- bg-tertiary-300 mt-2 mb-2"></div>
                )}
              </Fragment>
            ))}
          </div>
        }
      />
      );
    </div>
  );
}
