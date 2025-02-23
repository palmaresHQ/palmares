import { Fragment, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import Code from '../../components/Code';
import { getExamples } from '../../server/get-code';
import type { GetLibraryCodesFn } from '../../server/get-code';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    return {
      data: await getExamples()
    };
  }
});

function Home() {
  const [selectedCodeForMainPage, setSelectedCodeForMainPage] = useState<string>('databases.ts');
  const {
    data: { data, isChromium }
  } = Route.useLoaderData();

  const mainpageCodeFiles = (data as Awaited<ReturnType<GetLibraryCodesFn>>)['mainpage'];
  const favoritetoolsCodeFiles = (data as Awaited<ReturnType<GetLibraryCodesFn>>)['favoritetools'];
  const sidebarFiles = Object.keys(mainpageCodeFiles?.raw || {})
    .filter(
      (code) =>
        code.endsWith('databases.ts') ||
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
        isChromium={isChromium}
        text={mainpageCodeFiles?.raw[selectedCodeForMainPage] || ''}
        extraDts={mainpageCodeFiles?.raw}
        libraries={data as Awaited<ReturnType<GetLibraryCodesFn>>}
        sidebarWidth={'9rem'}
        commands={
          [
            // {
            //   command: 'npm install',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run makemigrations -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run migrate -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run seed -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run test -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // }
          ]
        }
        customSidebar={
          <div className="flex flex-col w-36 h-[860px] from-tertiary-500 to-white bg-gradient-to-b p-2">
            {sidebarFiles.map((code, index) => (
              <Fragment key={code}>
                <button
                  type={'button'}
                  onClick={() => setSelectedCodeForMainPage(code)}
                  className={`flex flex-row items-center justify-between p-2 w-full text-left ${selectedCodeForMainPage === code ? 'bg-tertiary-200' : 'bg-transparent'} font-light text-sm rounded-md`}
                >
                  {code.replace('src/core/', '')}
                  {selectedCodeForMainPage === code ? (
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
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-12">
        <h1 className="text-5xl font-bold text-primary-600 text-center">
          <span
            className="to-tertiary-500 from-tertiary-800 bg-gradient-to-r bg-clip-text inline-block mr-2 pt-2 pb-2"
            style={{
              color: 'transparent'
            }}
          >
            Powered by
          </span>
          your favorite tools
        </h1>
      </div>
      <Code
        height={860}
        width={680}
        isChromium={isChromium}
        text={(favoritetoolsCodeFiles?.raw['src/core/databases.ts'] || '')
          .replace('./schemas', './src/core/schemas')
          .replace('./tests', './src/core/tests')
          .replace('./server', './src/core/server')
          .replace('./databases', './src/core/databases')}
        extraDts={favoritetoolsCodeFiles?.raw}
        libraries={data as Awaited<ReturnType<GetLibraryCodesFn>>}
        sidebarWidth={'9rem'}
        commands={
          [
            // {
            //   command: 'npm install',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // }
            // {
            //   command: 'npm run makemigrations -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run migrate -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run seed -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // },
            // {
            //   command: 'npm run test -w mainpage',
            //   tag: 'Dev Server',
            //   shouldExit: true
            // }
          ]
        }
        // customSidebar={
        //   <div className="flex flex-col w-36 h-[860px] from-tertiary-500 to-white bg-gradient-to-b p-2">
        //     {sidebarFiles.map((code, index) => (
        //       <Fragment key={code}>
        //         <button
        //           type={'button'}
        //           onClick={() => setSelectedCode(code)}
        //           className={`flex flex-row items-center justify-between p-2 w-full text-left ${selectedCode === code ? 'bg-tertiary-200' : 'bg-transparent'} font-light text-sm rounded-md`}
        //         >
        //           {code.replace('src/core/', '')}
        //           {selectedCode === code ? (
        //             <div className="flex flex-col w-[24px] max-h-[24px]">
        //               <svg className="w-full h-full" viewBox="0 0 50 50">
        //                 <line className="stroke-primary-600" x1={35} y1={10} x2={40} y2={25} strokeWidth={2} />
        //                 <line className="stroke-primary-600" x1={40} y1={25} x2={35} y2={40} strokeWidth={2} />
        //               </svg>
        //             </div>
        //           ) : null}
        //         </button>
        //         {index === sidebarFiles.length - 1 ? null : (
        //           <div className="h-[2px] w- bg-tertiary-300 mt-2 mb-2"></div>
        //         )}
        //       </Fragment>
        //     ))}
        //   </div>
        // }
      />
    </div>
  );
}
