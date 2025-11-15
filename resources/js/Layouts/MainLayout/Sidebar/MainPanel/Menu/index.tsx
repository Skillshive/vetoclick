import { Link } from "@inertiajs/react";
// Local Imports
import { ScrollShadow } from "@/components/ui";
import { NavigationTree } from "@/@types/navigation";
import { useSidebarContext } from "@/contexts/sidebar/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import { Item } from "./item";

export interface MenuProps {
  nav?: NavigationTree[];
}

export function Menu({
  nav,
}: MenuProps) {
  const { isExpanded, open, close, setActiveSegmentPath: setSidebarActiveSegment } = useSidebarContext();
  const { menuItems, userRole, isAuthenticated } = useRoleBasedMenu();

  const handleSegmentSelect = (path: string) => {
    setSidebarActiveSegment(path);
    if (!isExpanded) {
      open();
    }
  };

  const handleMouseEnter = (path: string) => {
    setSidebarActiveSegment(path);
    if (!isExpanded) {
      open();
    }
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

  const itemsToRender = menuItems;
  return (
    <ScrollShadow
      data-root-menu
      className="hide-scrollbar flex w-full grow flex-col items-center space-y-4 overflow-y-auto pt-5 lg:space-y-3 xl:pt-5 2xl:space-y-4"
    >
      {itemsToRender.length === 0 ? (
        <div className="text-center text-gray-500 text-sm p-4">
          <p>No menu items found</p>
        </div>
      ) : (
        itemsToRender.map((item) => {
          const isLink = item.type === "item";
            const isActive = (() => {
            if (window.location.href === item.path) return true;
            if (item.submenu && Array.isArray(item.submenu)) {
              return item.submenu.some(
              (sub: any) => window.location.href === sub.path
              );
            }
            return false;
            })();

            return (
            <Item
              key={item.id}
              id={item.id}
              title={item.title}
              icon={item.icon}
              component={isLink ? Link : "button"}
              href={isLink ? item.path : undefined}
              onClick={() => {
              if (!isLink) handleSegmentSelect(item.path || item.id);
              }}
              onMouseEnter={() => {
              if (!isLink) handleMouseEnter(item.path || item.id);
              }}
              isActive={isActive}
            />
            );
        })
      )}
    </ScrollShadow>
  );
}
