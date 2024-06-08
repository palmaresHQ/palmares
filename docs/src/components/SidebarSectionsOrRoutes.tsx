'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import SidebarSectionOrRoute from './SidebarSectionOrRoute';
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

export default function SidebarRoutesOrSections(props: { routesOrSections: (Route | Section)[]; padding: number }) {
  const padding = props.padding || 0;

  return (
    <div className="w-full">
      {props.routesOrSections.map((routeOrSection, index) => (
        <SidebarSectionOrRoute routeOrSection={routeOrSection} padding={padding} />
      ))}
    </div>
  );
}
