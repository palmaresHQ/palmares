'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function Navbar() {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const searchParamsAsSearchParams = new URLSearchParams(searchParams);

  const urlToGoWhenModalClick = useMemo(() => {
    const hasNavbarModal = searchParamsAsSearchParams.has('navbarModal');
    if (hasNavbarModal) searchParamsAsSearchParams.delete('navbarModal');
    else searchParamsAsSearchParams.set('navbarModal', 'true');

    return `${currentPath}${searchParamsAsSearchParams.size > 0 ? `?${searchParamsAsSearchParams.toString()}` : ''}`;
  }, [currentPath, searchParams]);

  const routes = [
    { name: 'Home', href: '/' },
    { name: 'Docs', href: '/docs' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="flex relative items-center justify-between w-full p-4 h-20 bg-gray-800 text-white">
      <div className="items-center gap-4 md:flex hidden">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className="hover:underline">
            {route.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-col md:hidden">
        <Link href={urlToGoWhenModalClick} className="flex flex-col hover:bg-gray-700 hover:text-white">
          <div className="w-6 h-1 bg-white" />
          <div className="w-6 h-1 mt-1 bg-white" />
          <div className="w-6 h-1 mt-1 bg-white" />
        </Link>
      </div>

      <div
        className={`${searchParams.has('navbarModal') ? 'h-full' : 'h-0'
          } absolute top-20 right-0 flex flex-col items-start pr-4 pl-4 md:hidden bg-gray-800 w-full transition-[height,opacity] z-10 overflow-auto`}
      >
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className="hover:underline">
            {route.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
