import { useSidebarContext } from "@/contexts/sidebar/context";
import { useTranslation } from "@/hooks/useTranslation";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export function SettingsButton() {
  const { setActiveSegmentPath, open, isExpanded, toggle } = useSidebarContext();
  const { t } = useTranslation();
  const pathname = window.location.pathname;

  // Check if we're on a settings-related page
  const isSettingsActive = pathname.startsWith('/settings/') || 
                          pathname === '/roles' || 
                          pathname.startsWith('/roles/') ||
                          pathname === '/subscription-plans' || 
                          pathname.startsWith('/subscription-plans/');

  const handleClick = () => {
    setActiveSegmentPath('settings');
    
    // Force open the sidebar
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
