// Import Dependencies
import clsx from "clsx";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";

// Local Imports
import { Button } from "@/components/ui";
import { Menu } from "./Menu";
import { NavigationTree } from "@/@types/navigation";
import { useThemeContext } from "@/contexts/theme/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import { useSidebarContext } from "@/contexts/sidebar/context";

// ----------------------------------------------------------------------

export interface PrimePanelProps {
  currentSegment?: NavigationTree;
  pathname: string;
  close: () => void;
}

export function PrimePanel({ currentSegment, pathname, close }: PrimePanelProps) {
  const { cardSkin } = useThemeContext();
  const { t } = useTranslation();
  const { menuItems } = useRoleBasedMenu();
  const { activeSegmentPath } = useSidebarContext();

  // Find the current menu item based on active segment
  const currentMenuItem = menuItems.find(item => item.id === activeSegmentPath) || 
                        menuItems.find(item => item.submenu?.some(sub => sub.id === activeSegmentPath));

  const title = currentMenuItem?.title || t(currentSegment?.transKey ?? "") || currentSegment?.title;

  // Get submenu items for the current active segment
  const getSubmenuItems = () => {
    if (!currentMenuItem) return [];
    
    if (currentMenuItem.submenu) {
      return currentMenuItem.submenu;
    }
    
    // If no submenu, return the item itself as a single item
    return [currentMenuItem];
  };

  const submenuItems = getSubmenuItems();

  return (
    <div
      className={clsx(
        "prime-panel flex h-full flex-col",
        cardSkin === "shadow"
          ? "shadow-soft dark:shadow-dark-900/60"
          : "dark:border-dark-600/80 ltr:border-r rtl:border-l",
      )}
      onMouseLeave={close}
    >
      <div
        className={clsx(
          "flex h-full grow flex-col bg-white ltr:pl-(--main-panel-width) rtl:pr-(--main-panel-width)",
          cardSkin === "shadow" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
        <div className="relative flex h-16 w-full shrink-0 items-center justify-between pl-4 pr-1 rtl:pl-1 rtl:pr-4">
          <p className="truncate text-base tracking-wider text-gray-800 dark:text-dark-100">
            {title}
          </p>
          <Button
            onClick={close}
            isIcon
            variant="flat"
            className="size-7 rounded-full xl:hidden"
          >
            <ChevronLeftIcon className="size-6 rtl:rotate-180" />
          </Button>
        </div>
        {submenuItems.length > 0 && (
          <Menu nav={submenuItems} pathname={pathname} />
        )}
      </div>
    </div>
  );
}
