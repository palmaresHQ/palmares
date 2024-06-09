import Link from 'next/link';
import SidebarSection from './SidebarSectionsOrRoutes';

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
export default function Sidebar(props: { route: Route }) {
  return (
    <aside className="flex flex-col w-64 h-screen bg-gray-800 p-4">
      <Link href={props.route.path} className="text-white italic hover:underline pt-1 pb-1">
        <h3 className="text-sm text-white font-bold">{props.route.title}</h3>
      </Link>
      <SidebarSection routesOrSections={props.route.routes || []} padding={0} />
    </aside>
  );
}
