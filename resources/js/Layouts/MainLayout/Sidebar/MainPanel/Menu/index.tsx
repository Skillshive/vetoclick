import { Link } from "@inertiajs/react";
import { useEffect } from "react";
// Local Imports
import { ScrollShadow } from "@/components/ui";
import { NavigationTree } from "@/@types/navigation";
import { useSidebarContext } from "@/contexts/sidebar/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import { Item } from "./item";
import { useTranslation } from "@/hooks/useTranslation";

export interface MenuProps {
  nav?: NavigationTree[];
}

export function Menu({}: MenuProps) {
  const { isExpanded, open, close, setActiveSegmentPath: setSidebarActiveSegment, activeSegmentPath } = useSidebarContext();
  const { menuItems } = useRoleBasedMenu();
  const { t } = useTranslation();

  // Check if all menu items are type "item" (no groups or collapses)
  const allItemsAreTypeItem = menuItems.length > 0 && menuItems.every(item => item.type === "item");
  
  // Don't close sidebar if settings is active
  const isSettingsActive = activeSegmentPath === 'settings';

  // Close sidebar if it's open and all items are type "item", but not if settings is active
  useEffect(() => {
    if (allItemsAreTypeItem && isExpanded && !isSettingsActive) {
      close();
      setSidebarActiveSegment('');
    }
  }, [allItemsAreTypeItem, isExpanded, isSettingsActive, close, setSidebarActiveSegment]);

  const handleSegmentSelect = (path: string) => {
    if (allItemsAreTypeItem) {
      close();
      return; // Disable sidebar opening when all items are type "item"
    }
    setSidebarActiveSegment(path);
    if (!isExpanded) {
      open();
    }
  };

  const handleMouseEnter = (path: string) => {
    if (allItemsAreTypeItem) {
      close();
      return; // Disable hover when all items are type "item"
    }
    setSidebarActiveSegment(path);
    if (!isExpanded) {
      open();
    }
  };

  const itemsToRender = menuItems;
  return (
    <ScrollShadow
      data-root-menu
      className="hide-scrollbar flex w-full grow flex-col items-center space-y-4 overflow-y-auto pt-5 lg:space-y-3 xl:pt-5 2xl:space-y-4"
    >
      {itemsToRender.length === 0 ? (
        <div className="text-center text-gray-500 text-sm p-4">
          <p>{t('common.no_menu_items') }</p>
        </div>
      ) : (
        itemsToRender.map((item) => {
          const isLink = item.type === "item";
            const isActive = (() => {
            if (window.location.href === item.path) return true;
            if (item.submenu && Array.isArray(item.submenu)) {
              return item.submenu.some(
              (sub) => window.location.href === sub.path
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
              onClick={allItemsAreTypeItem ? undefined : () => {
              if (!isLink) {
                handleSegmentSelect(item.path || item.id);
              } else {
                setSidebarActiveSegment('');
                close();
              }
              }}
              onMouseEnter={allItemsAreTypeItem ? undefined : () => {
              if (!isLink) handleMouseEnter(item.path || item.id);
              }}
              isActive={isActive}
              disableHover={allItemsAreTypeItem}
            />
            );
        })
      )}
    </ScrollShadow>
  );
}
