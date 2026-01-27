import { useSidebarContext } from "@/contexts/sidebar/context";
import { useTranslation } from "@/hooks/useTranslation";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export function SettingsButton() {
  const { setActiveSegmentPath, open, isExpanded } = useSidebarContext();
  const { t } = useTranslation();
  const { hasPermission, hasAnyRole } = useRoleBasedMenu();
  const pathname = window.location.pathname;

  // Check if user is admin or super-admin - always show settings for them
  const isAdmin = hasAnyRole(['admin', 'super-admin']);
  const isVeterinarian = hasAnyRole(['veterinarian']);

  // Settings menu items with permission checks
  const allSettingsItems = [
    { 
      permission: "settings.view",
      roles: ["admin", "super-admin", "veterinarian"]
    },
    { 
      permission: "holidays.view",
      roles: ["super-admin", "veterinarian"]
    },
    { 
      permission: "availability.view",
      roles: ["super-admin", "veterinarian"]
    },
    { 
      permission: "roles.view",
      roles: ["admin", "super-admin"]
    },
    { 
      permission: "subscription-plans.view",
      roles: ["admin", "super-admin"]
    }
  ];

  const settingsItems = allSettingsItems.filter(item => {
    if (item.permission && hasPermission(item.permission)) {
      return true;
    }
    if (item.roles && item.roles.length > 0 && hasAnyRole(item.roles)) {
      return true;
    }
    return false;
  });

  const shouldShowSettings = isAdmin || isVeterinarian || settingsItems.length > 1;
  
  if (!shouldShowSettings) {
    return null;
  }

  const isSettingsActive = pathname.startsWith('/settings/') || 
                          pathname === '/roles' || 
                          pathname.startsWith('/roles/') ||
                          pathname === '/subscription-plans' || 
                          pathname.startsWith('/subscription-plans/');

  const handleClick = () => {
    setActiveSegmentPath('settings');
    
    if (!isExpanded) {
      open();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
        isSettingsActive 
          ? 'bg-primary-600/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-400' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      title={t('common.settings')}
    >
        <SettingIcon className={`w-8 h-8 transition-colors ${
          isSettingsActive
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
        }`} />
    </button>
  );
}
