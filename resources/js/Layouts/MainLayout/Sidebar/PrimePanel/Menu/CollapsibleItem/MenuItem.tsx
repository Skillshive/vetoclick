// Import Dependencies
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "@inertiajs/react";

// Local Imports
import { Badge } from "@/components/ui";
import { NavigationTree } from "@/@types/navigation";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useSidebarContext } from "@/contexts/sidebar/context";

// ----------------------------------------------------------------------

export function MenuItem({ data }: { data: NavigationTree }) {
  const { path, id } = data;
  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();
  
  // Title is already translated by useRoleBasedMenu hook
  const title = data.title;
  const info = data.info;

  const handleMenuItemClick = () => {
    if (lgAndDown) close();
  };

  return (
    <Link
      href={path as string}
      onClick={handleMenuItemClick}
      id={id}
      className={clsx(
        "text-xs-plus flex items-center justify-between px-2 tracking-wide outline-hidden transition-[color,padding-left,padding-right] duration-300 ease-in-out hover:ltr:pl-4 hover:rtl:pr-4",
        "dark:text-dark-200 dark:hover:text-dark-50 dark:focus:text-dark-50 text-gray-600 hover:text-gray-900 focus:text-gray-900",
      )}
    >
      <div
        data-menu-active={false}
        className="flex min-w-0 items-center justify-between"
        style={{ height: "34px" }}
      >
        <div className="flex min-w-0 items-center space-x-2 rtl:space-x-reverse  gap-2">
          <div
            className={clsx(
              "opacity-50 transition-all",
              "size-1.5 rounded-full border border-current",
            )}
          ></div>
          <span className="truncate">{title}</span>
        </div>
        {info && info.val && (
          <Badge
            color={info.color}
            className="h-5 min-w-[1.25rem] shrink-0 rounded-full p-[5px]"
          >
            {info.val}
          </Badge>
        )}
      </div>
    </Link>
  );
}
