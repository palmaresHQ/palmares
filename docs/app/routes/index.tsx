import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { Fragment, lazy, Suspense, useState } from 'react';

const Code = lazy(() => import('../../components/Code'));

type LibraryCode = { [key: string]: Record<string, string> };

const getLibraryCodes = async (libraries: [string, string][]) => {
  let libraryCodes = {} as LibraryCode;

  async function getFiles(
    dir: string,
    rootDir = dir,
    files = {} as LibraryCode[string],
    filesOrFoldersToConsider = undefined as string[] | undefined,
    hasFoundPackageJson = false
  ) {
    const fileList = await fs.readdir(dir);
    if (hasFoundPackageJson === false) {
      for (const file of fileList) {
        if (file === 'package.json') {
          hasFoundPackageJson = true;
          const packageJsonContents = await fs.readFile(path.join(dir, file), 'utf8');
          const packageJson = JSON.parse(packageJsonContents);
          if (packageJson.files) {
            files['package.json'] = packageJsonContents;
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
            const filePathRelativeToRoot = path.relative(rootDir, filePath);
            files[filePathRelativeToRoot] = await fs.readFile(filePath, 'utf8');
          }
        })
      );
    }
  }

  await Promise.all(
    libraries.map(async ([library, path]) => {
      libraryCodes[library] = {} as LibraryCode[string];
      await getFiles(path, path, libraryCodes[library]);
    })
  );
  return libraryCodes;
};

const getAllLibraryCodes = createServerFn({ method: 'GET' }).handler(() => {
  return getLibraryCodes([
    ['@palmares/core', '../packages/core'],
    ['@palmares/databases', '../packages/databases'],
    ['@palmares/schemas', '../packages/schemas'],
    ['@palmares/server', '../packages/server'],
    ['@palmares/tests', '../packages/tests'],
    ['@palmares/logging', '../packages/logging'],
    ['@palmares/events', '../packages/events']
  ]);
});

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getAllLibraryCodes()
});

const fileByCode = {
  [`databases.ts`]: `import {  define, fields, Model, ON_DELETE } from '@palmares/databases';

export class Company extends Model<Company>() {
  fields = {
    id: fields.auto(),
    name: fields.char({ maxLen: 255 }),
    isActive: fields.bool().default(true)
  }
}

export const User = define('User', {
  fields: {
    id: fields.auto(),
    firstName: fields.char({ maxLen: 255 }),
    email: fields.text().allowNull(),
    companyId: fields.foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE
    })
  }
});

await Company.default.set((qs) =>
    qs
      .join(User, 'usersOfCompany', (qs) =>
        qs.data(
          {
            firstName: 'Foo',
            email: 'foo@bar.com'
          },
          {
            firstName: 'John',
            email: 'john@doe.com'
          }
        )
      )
      .data({
        name: 'Evil Foo',
        isActive: true
      })
);
`,
  [`schemas.ts`]:
    "import * as p from '@palmares/schemas';\n" +
    '\n' +
    'export const userSchema = p.object({\n' +
    '  name: p.string(),\n' +
    '  age: p.number().omit()\n' +
    '}).onSave(async (data) => {\n' +
    '  console.log(`Saving the user ${data.name} with age ${data.age} to the database`);\n' +
    '  return data;\n' +
    '});\n' +
    '\n' +
    "const validationResp = await userSchema.validate({ name: 'John', age: 30 }, {});\n" +
    'if (!validationResp.isValid) {\n' +
    '  throw new Error(`Invalid Data ${validationResp.errors}`)\n' +
    '}\n' +
    'const data = await validationResp.save();\n' +
    '\n' +
    "console.log('Age is ommited, check the type', data.age);\n" +
    "console.log('Just name is returned', data.name);\n" +
    '',
  [`server.ts`]: `import { path, Response, middleware } from '@palmares/server';

import { User } from './databases';
import { userSchema } from './schemas';

const companyMiddleware = middleware({
  request: async (request) => {
    console.log('Request received', request.url);

    return request.clone({
      context: {
        company: {
          id: 123,
        }
      }
    });
  }
})

path('/users')
  .middlewares([companyMiddleware])
  .get(async (request) => {
    const users = await User.default.get((qs) =>
      qs.where({
        companyId: request.context.company.id
      })
    );
    return Response.json({ users });
  })
  .post(async (request) => {
    const validationResp = await userSchema.validate(await request.json(), {});
    if (!validationResp.isValid) {
      return Response.json({
        success: false,
        errors: validationResp.errors
      }, { status: 400 });
    }
    return Response.json({ success: true, data: await validationResp.save() });
  })
  .nested((path) => [
    path('/<id: number>')
      .get(async (request) => {
        const user = await User.default.get((qs) => qs.where({ id: request.params.id }));
        return Response.json({ user: user[0] });
      })
  ]);
`,
  [`tests.ts`]: `import { describe } from '@palmares/tests';

describe('My tests', ({ test }) => {
  test('My first test', ({ expect }) => {
    expect(1 + 1).toBe(2);
  })
})
`
};

function Home() {
  const [selectedCode, setSelectedCode] = useState<keyof typeof fileByCode>('databases.ts');
  const state = Route.useLoaderData();

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
      <Suspense fallback="Loading Code">
        <Code
          height={840}
          width={680}
          text={fileByCode[selectedCode]}
          extraDts={fileByCode}
          libraries={state}
          sidebarWidth={'9rem'}
          customSidebar={
            <div className="flex flex-col w-36 h-[840px] from-tertiary-500 to-white bg-gradient-to-b p-2">
              {Object.keys(fileByCode).map((code, index) => (
                <Fragment key={code}>
                  <button
                    type={'button'}
                    onClick={() => setSelectedCode(code as keyof typeof fileByCode)}
                    className={`flex flex-row items-center justify-between p-2 w-full text-left ${selectedCode === code ? 'bg-tertiary-200' : 'bg-transparent'} font-light text-sm rounded-md`}
                  >
                    {code}
                    {selectedCode === code ? (
                      <div className="flex flex-col w-[24px] max-h-[24px]">
                        <svg className="w-full h-full" viewBox="0 0 50 50">
                          <line className="stroke-primary-600" x1={35} y1={10} x2={40} y2={25} strokeWidth={2} />
                          <line className="stroke-primary-600" x1={40} y1={25} x2={35} y2={40} strokeWidth={2} />
                        </svg>
                      </div>
                    ) : null}
                  </button>
                  {index === Object.keys(fileByCode).length - 1 ? null : (
                    <div className="h-[2px] w- bg-tertiary-300 mt-2 mb-2"></div>
                  )}
                </Fragment>
              ))}
            </div>
          }
        />
      </Suspense>
    </div>
  );
}
