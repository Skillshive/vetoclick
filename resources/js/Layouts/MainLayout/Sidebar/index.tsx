import { usePage } from "@inertiajs/react";

// Local Imports
import { useDidUpdate } from "@/hooks";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useSidebarContext } from "@/contexts/sidebar/context";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";

export type SegmentPath = string | undefined;

export function Sidebar() {
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close, activeSegmentPath } = useSidebarContext();
  const { url } = usePage() as any;
  const { menuItems } = useRoleBasedMenu();

  // Check if all menu items are type "item" (no groups or collapses)
  const allItemsAreTypeItem = menuItems.length > 0 && menuItems.every(item => item.type === "item");
  
  // Allow PrimePanel to show when settings is active, even if all items are type "item"
  const isSettingsActive = activeSegmentPath === 'settings' || 
                          url.startsWith('/settings/') ;
  
  const shouldShowPrimePanel = !allItemsAreTypeItem || isSettingsActive;

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <>
      <MainPanel />
      {shouldShowPrimePanel && <PrimePanel close={close} pathname={url} />}
    </>
  );
}
