// Import Dependencies
import clsx from "clsx";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "@inertiajs/react";
import { 
  UserIcon, 
  PaintBrushIcon, 
  UserGroupIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  Cog6ToothIcon as SettingIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Button, ScrollShadow } from "@/components/ui";
import { Menu } from "./Menu";
import { NavigationTree } from "@/@types/navigation";
import { useThemeContext } from "@/contexts/theme/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import { useSidebarContext } from "@/contexts/sidebar/context";
import { ThemeModeChanger } from "@/components/shared/ThemeModeChanger";

// ----------------------------------------------------------------------

export interface PrimePanelProps {
  currentSegment?: NavigationTree;
  pathname: string;
  close: () => void;
}

export function PrimePanel({ currentSegment, pathname, close }: PrimePanelProps) {
  const { cardSkin } = useThemeContext();
  const { t } = useTranslation();
  const { menuItems, hasPermission, hasRole, hasAnyRole } = useRoleBasedMenu();
  const { activeSegmentPath } = useSidebarContext();

  // Settings menu items with permission checks
  const allSettingsItems = [
    { 
      name: t("common.prime_panel.general"), 
      icon: UserIcon, 
      href: "/settings/general",
      permission: "settings.view",
      roles: ["admin", "super-admin", "veterinarian"]
    },
    { 
      name: t("common.prime_panel.appearance"), 
      icon: PaintBrushIcon, 
      href: "/settings/appearance",
      permission: "settings.view",
      roles: ["admin", "super-admin", "veterinarian"]
    },
    { 
      name: t("common.prime_panel.holidays"), 
      icon: CalendarIcon, 
      href: "/settings/holidays",
      permission: "holidays.view",
      roles: ["super-admin", "veterinarian"]
    },
    { 
      name: t("common.prime_panel.availabilities"), 
      icon: CalendarDaysIcon, 
      href: "/settings/availabilities",
      permission: "availability.view",
      roles: ["super-admin", "veterinarian"]
    },
    { 
      name: t("common.prime_panel.roles"), 
      icon: UserGroupIcon, 
      href: "/roles",
      permission: "roles.view",
      roles: ["admin", "super-admin"]
    },
    { 
      name: t("common.prime_panel.subscription_plans"), 
      icon: CreditCardIcon, 
      href: "/subscription-plans",
      permission: "subscription-plans.view",
      roles: ["admin", "super-admin"]
    }
  ];

  // Filter settings items based on permissions and roles
  const settingsItems = allSettingsItems.filter(item => {
    // Check if user has the required permission (preferred method)
    if (item.permission && hasPermission(item.permission)) {
      return true;
    }
    // Fallback: Check if user has one of the required roles
    if (item.roles && item.roles.length > 0 && hasAnyRole(item.roles)) {
      return true;
    }
    return false;
  });

  // Check if we're showing settings menu
  const isPathSettings = pathname.startsWith('/settings/') || 
                        pathname === '/roles' || 
                        pathname.startsWith('/roles/') ||
                        pathname === '/subscription-plans' || 
                        pathname.startsWith('/subscription-plans/');
  
  // If activeSegmentPath is explicitly set to something other than 'settings', use that
  // Otherwise, determine based on pathname
  const isSettingsActive = activeSegmentPath === 'settings' || 
                          (!activeSegmentPath && isPathSettings);

  // Find the current menu item based on active segment
  const currentMenuItem = menuItems.find(item => item.id === activeSegmentPath) || 
                        menuItems.find(item => item.submenu?.some(sub => sub.id === activeSegmentPath));

  const title = (isSettingsActive && settingsItems.length > 1) ? t("common.prime_panel.settings") : (currentMenuItem?.title || t(currentSegment?.transKey ?? "") || currentSegment?.title);

  // Get submenu items for the current active segment
  const getSubmenuItems = () => {
    if (isSettingsActive) return [];
    
    if (!currentMenuItem) return [];
    
    if (currentMenuItem.submenu) {
      return currentMenuItem.submenu;
    }
    
    // If no submenu, return the item itself as a single item
    return [currentMenuItem];
  };

  const submenuItems = getSubmenuItems();

  // Function to check if a settings menu item is active
  const isSettingsItemActive = (href: string) => {
    if (href === '/settings/general' || href === '/settings/appearance' || href === '/settings/sessions') {
      return pathname === href;
    }
    // For other routes like /roles, /subscription-plans, check if pathname starts with the href
    return pathname.startsWith(href);
  };

  return (
    <div
      className={clsx(
        "prime-panel flex h-full flex-col px-2",
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
        <div className="relative flex h-16 w-full aspect-square shrink-0 items-center gap-2 pl-4 pr-1 rtl:pl-1 rtl:pr-4">
        {(currentMenuItem?.icon || (isSettingsActive && settingsItems.length > 1)) && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20"  style={{ borderRadius: '50%', padding: currentMenuItem?.id === 'appointments' ? '6px' : undefined }}>
            {isSettingsActive && settingsItems.length > 1 ? (
              <SettingIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            ) : (
              currentMenuItem?.icon && <currentMenuItem.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            )}
          </div>}
          <p className="text-base tracking-wider text-gray-800 dark:text-dark-100 leading-tight">
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
        {isSettingsActive && settingsItems.length > 1 ? (
          <ScrollShadow className="grow">
            {/* Settings Menu Items */}
            <div className="py-2 space-y-1">
              {settingsItems.map((item) => {
                const isActive = isSettingsItemActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={close}
                  >
                    <item.icon className={clsx(
                      "w-5 h-5",
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-500 dark:text-gray-400"
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </ScrollShadow>
        ) : (
          submenuItems.length > 0 ? (
            <Menu nav={submenuItems} pathname={pathname} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t("common.prime_panel.select_menu_item")}
              </p>
            </div>
          )
        )}
        
        {/* Theme Mode Changer - Always show at bottom */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <ThemeModeChanger />
        </div>
      </div>
    </div>
  );
}
