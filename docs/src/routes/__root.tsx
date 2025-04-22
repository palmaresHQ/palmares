import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router';
import { createServerFn, Scripts } from '@tanstack/react-start';
import type { ReactNode } from 'react';
import appCss from '../styles/app.css?url';
import { isChromium } from '../../utils/is-chromium';
import { getHeaders } from 'vinxi/http';

const getIfIsChromium = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    data: isChromium(getHeaders())
  };
});

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center h-[100vh] w-full">
      <div className="flex flex-col w-full items-center justify-center mt-12 mb-12">
        <h1 className="text-8xl font-black text-tertiary-900">You are probably lost</h1>
        <div className="flex w-48 h-48">
          <img src="/Palmares.png" alt="logo" className="w-full h-full" />
        </div>
        <p className="text-2xl font-thin text-primary-600">
          We were lost too. That's why we created palmares. We hope you find it useful.
        </p>
      </div>
    </div>
  ),
  loader: async () => {
    return {
      data: await getIfIsChromium()
    };
  },
  headers: (ctx) => {
    if (ctx?.loaderData?.data?.data === false) return {};
    return {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    } as any;
  },
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Palmares'
      }
    ]
  }),
  component: RootComponent
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
