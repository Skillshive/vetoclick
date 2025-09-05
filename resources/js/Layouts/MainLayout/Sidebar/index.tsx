import { usePage } from "@inertiajs/react";

// Local Imports
import { useDidUpdate } from "@/hooks";
import { isRouteActive } from "@/utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { navigation } from "@/navigation";
import { useSidebarContext } from "@/contexts/sidebar/context";

export type SegmentPath = string | undefined;

export function Sidebar() {
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close, activeSegmentPath } = useSidebarContext();
  const { url } = usePage() as any;

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <>
      <MainPanel />
      <PrimePanel close={close} pathname={url} />
    </>
  );
}
