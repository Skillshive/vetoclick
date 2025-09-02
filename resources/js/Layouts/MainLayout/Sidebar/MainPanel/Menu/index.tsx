// Import Dependencies
import { Dispatch, SetStateAction } from "react";
import { Link, usePage } from "@inertiajs/react";
// Local Imports
import { ScrollShadow } from "@/components/ui";
import { NavigationTree } from "@/@types/navigation";
import { useSidebarContext } from "@/contexts/sidebar/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import {  isURLMatch } from "@/utils/isRouteActive";
import { Item } from "./item";
import { SegmentPath } from "@/demo/src/app/layouts/MainLayout/Sidebar";

export interface MenuProps {
  nav?: NavigationTree[];
  activeSegmentPath: SegmentPath;
  setActiveSegmentPath?: Dispatch<SetStateAction<SegmentPath>>;
}

export function Menu({
  nav,
  setActiveSegmentPath,
  activeSegmentPath,
}: MenuProps) {
  const { isExpanded, open, close, setActiveSegmentPath: setSidebarActiveSegment } = useSidebarContext();
  const { menuItems, userRole, isAuthenticated } = useRoleBasedMenu();
  const { url } = usePage() as any;

  const handleSegmentSelect = (path: string) => {
    setActiveSegmentPath?.(path);
    setSidebarActiveSegment(path);
    if (!isExpanded) {
      open();
    }
  };

  const handleMouseEnter = (path: string) => {
    setActiveSegmentPath?.(path);
    setSidebarActiveSegment(path);
    if (!isExpanded) {
      open();
    }
  };

  const handleMouseLeave = () => {
    // Close the sidebar on mouse leave
    close();
  };

  const getMainNavigationItems = (items: any[]) => {
    const mainItems = items.map(item => ({
      id: item.id,
      title: item.title,
      icon: item.icon,
      path: item.path || '',
      type: item.type,
    }));
    return mainItems;
  };

  const itemsToRender = nav || getMainNavigationItems(menuItems);
  return (
    <ScrollShadow
      data-root-menu
      className="hide-scrollbar flex w-full grow flex-col items-center space-y-4 overflow-y-auto pt-5 lg:space-y-3 xl:pt-5 2xl:space-y-4"
      onMouseLeave={handleMouseLeave}
    >
      {itemsToRender.length === 0 ? (
        <div className="text-center text-gray-500 text-sm p-4">
          <p>No menu items found</p>
          <p>Role: {userRole}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        itemsToRender.map((item) => {
          const isLink = item.type === "item";
          return (
            <Item
              key={item.id}
              id={item.id}
              title={item.title}
              icon={item.icon}
              component={isLink ? Link : "button"}
              href={isLink ? item.path : undefined}
              onClick={() => {
                if(!isLink) handleSegmentSelect(item.id)
                else close();
              }}
              onMouseEnter={() => {
                if(!isLink) handleMouseEnter(item.id);
              }}
              onMouseLeave={handleMouseLeave}
              isActive={isURLMatch(item.path, url)}
            />
          );
        })
      )}
    </ScrollShadow>
  );
}
