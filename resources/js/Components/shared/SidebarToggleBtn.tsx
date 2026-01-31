import { useEffect, MouseEvent } from "react";
import { useSidebarContext } from "@/contexts/sidebar/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import clsx from "clsx";

export function SidebarToggleBtn() {
  const { toggle, open, isExpanded, close, activeSegmentPath } = useSidebarContext();
  const { menuItems } = useRoleBasedMenu();

  // Check if all menu items are type "item" (no groups or collapses)
  const allItemsAreTypeItem = menuItems.length > 0 && menuItems.every(item => item.type === "item");
  
  // Don't close sidebar if settings is active
  const isSettingsActive = activeSegmentPath === 'settings';

  // Close sidebar if it's open and all items are type "item", but not if settings is active
  useEffect(() => {
    if (allItemsAreTypeItem && isExpanded && !isSettingsActive) {
      close();
    }
  }, [allItemsAreTypeItem, isExpanded, isSettingsActive, close]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (allItemsAreTypeItem) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggle();
  };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (allItemsAreTypeItem) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!isExpanded) {
      open();
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={allItemsAreTypeItem}
      className={clsx(
        isExpanded && "active",
        allItemsAreTypeItem 
          ? "sidebar-toggle-btn cursor-not-allowed flex size-7 flex-col justify-center space-y-1.5 text-primary-600 outline-hidden focus:outline-hidden dark:text-gray-500 ltr:ml-0.5 rtl:mr-0.5"
          : "sidebar-toggle-btn cursor-pointer flex size-7 flex-col justify-center space-y-1.5 text-primary-600 outline-hidden focus:outline-hidden dark:text-primary-400 ltr:ml-0.5 rtl:mr-0.5",
      )}
      aria-disabled={allItemsAreTypeItem}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
