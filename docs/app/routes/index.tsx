import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { WebContainer } from '@webcontainer/api';
import { lazy, Suspense } from 'react';

const webcontainerInstance = await WebContainer.boot();
const Code = lazy(() => import('../../components/Code'))

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex flex-col">
      <nav className="flex flex-row justify-center items-center w-full mt-24 mb-24">
        <div className="flex flex-row justify-evenly w-96">
          <a className="text-primary-500">blog</a>
          <p className="text-primary-500 select-none">/</p>
          <a className="text-primary-500">about</a>
          <p className="text-primary-500 select-none">/</p>
          <a className="text-primary-500">docs</a>
        </div>
      </nav>
      <div className="flex flex-col justify-center items-center mb-12">
        <h3 className="text-2xl font-thin text-primary-600">
          A Javascript and Typescript framework for unification.
        </h3>
      </div>
      <div className="flex flex-col justify-center items-center h-[1px] w-full">
        <div className="h-full w-24 bg-primary-400"></div>
      </div>
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-12">
        <h1 className="text-8xl font-black text-primary-900">palmares.</h1>
        <div className="flex w-48 h-48">
          <img src="/Palmares.png" alt="logo" className="w-full h-full" />
        </div>
        <button className="border-primary-300 border-[1px] p-4 rounded-sm text-primary-600 font-light hover:border-primary-400 hover:text-tertiary-700 hover:font-normal hover:transition-all">
          <p className="text-4xl">npx palmares@latest new app</p>
        </button>
      </div>
      <div className="flex flex-col justify-center items-center h-[1px] w-full">
        <div className="h-full w-24 bg-primary-400"></div>
      </div>
      <div className="flex flex-col justify-center items-center mt-12 mb-12 text-justify">
        <div className="flex flex-col max-w-2xl">
          <p className="font-thin">
            Palmares is a framework that aims for unification and freedom. It's opinionated at the same time it's not. Bring your own tools, forget thinking if X works with Y. With Palmares it just works! You can use it even without a server!
          </p>
          <p className="font-thin mt-2">
            You can also strip the hole framework apart and just use what you need from it on your projects. You don't need to use Palmares to use Palmares!
          </p>
          <p className="font-thin mt-2">
            It's aimed to work well on monorepos and have ZERO dependencies at it's core. Where javascript runs, this framework is supposed to run as well. Even on places where javascript is definitely the worst language choice!
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center h-[1px] w-full">
        <div className="h-full w-24 bg-primary-400"></div>
      </div>
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-12">
        <h1 className="text-5xl font-bold text-primary-600 text-center">Fully Typed</h1>
      </div>
      <Suspense fallback="Loading Code">
        <Code />
      </Suspense>
    </div>
  )
}
