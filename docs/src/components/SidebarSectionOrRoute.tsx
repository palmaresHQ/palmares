'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import SidebarSectionsOrRoutes from './SidebarSectionsOrRoutes';
type Section = {
  title: string;
  isSubsection: true;
  routes: (Route | Section)[];
};

type Route = {
  path: string;
  title: string;
  routes?: (Route | Section)[];
};

export default function SidebarSection(props: { routeOrSection: Route | Section; padding: number }) {
  const padding = props.padding || 0;
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const searchParamsAsSearchParams = new URLSearchParams(searchParams);
  const slugTitle = props.routeOrSection.title
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const slugTitleSidebarModal = `${slugTitle}-sidebar-open`;
  console.log(slugTitleSidebarModal);
  const urlToGoWhenSectionClick = useMemo(() => {
    const hasNavbarModal = searchParamsAsSearchParams.has(slugTitleSidebarModal);
    if (hasNavbarModal) searchParamsAsSearchParams.delete(slugTitleSidebarModal);
    else searchParamsAsSearchParams.set(slugTitleSidebarModal, 'true');

    return `${currentPath}${searchParamsAsSearchParams.size > 0 ? `?${searchParamsAsSearchParams.toString()}` : ''}`;
  }, [currentPath, searchParams, slugTitleSidebarModal]);

  if ('isSubsection' in props.routeOrSection) {
    return (
      <div
        key={props.routeOrSection.title}
        className="flex items-stretch justify-stretch w-full pt-1 pb-1 select-none flex-col"
      >
        <Link
          href={urlToGoWhenSectionClick}
          className={`text-xl text-white font-bold bg-slate-700 pt-2 pb-2 pl-1 pr-1 rounded-md ml-${padding} hover:bg-slate-600 text-start`}
        >
          {props.routeOrSection.title}
        </Link>
        <div
          className={`${
            searchParams.has(slugTitleSidebarModal)
              ? 'relative max-h-96 scale-y-100'
              : 'scale-y-0 max-h-0 top-full z-10'
          } origin-top mt-2 w-full transition-[transform,max-height] overflow-hidden`}
        >
          <SidebarSectionsOrRoutes routesOrSections={props.routeOrSection.routes} padding={padding + 1} />
        </div>
      </div>
    );
  }
  return (
    <div key={props.routeOrSection.path}>
      <Link
        className={`text-md hover:underline text-white mt-2`}
        href={props.routeOrSection.path}
        style={{
          marginLeft: `${padding}rem`,
        }}
      >
        {props.routeOrSection.title}
      </Link>
      {props.routeOrSection.routes && (
        <SidebarSectionsOrRoutes routesOrSections={props.routeOrSection.routes} padding={padding + 1} />
      )}
    </div>
  );
}
