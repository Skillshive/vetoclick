import { useSidebarContext } from "@/contexts/sidebar/context";
import clsx from "clsx";

export function SidebarToggleBtn() {
  const { toggle, isExpanded } = useSidebarContext();

  return (
    <button
      onClick={toggle}
      className={clsx(
        isExpanded && "active",
        "sidebar-toggle-btn cursor-pointer flex size-7 flex-col justify-center space-y-1.5 text-primary-600 outline-hidden focus:outline-hidden dark:text-primary-400 ltr:ml-0.5 rtl:mr-0.5",
      )}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
