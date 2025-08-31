// Import Dependencies
import clsx from "clsx";
import invariant from "tiny-invariant";
import { useTranslation } from "react-i18next";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

// Local Imports
import { Badge } from "@/components/ui";
import { NavigationTree } from "@/@types/navigation";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useSidebarContext } from "@/contexts/sidebar/context";

// ----------------------------------------------------------------------

export function MenuItem({ data }: { data: NavigationTree }) {
  const { id, transKey, path, title } = data;
  const { t } = useTranslation();
  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();
  const { url } = usePage();

  invariant(path, `[MenuItem] Path is required for navigation item`);

  const label = transKey ? t(transKey) : title;
  const isActive = url === path || window.location.pathname === path;

  const handleMenuItemClick = () => lgAndDown && close();

  return (
    <div className="relative flex">
      <Link
        href={path}
        onClick={handleMenuItemClick}
        className={clsx(
          "group min-w-0 flex-1 rounded-md px-3 py-2 font-medium outline-hidden transition-colors ease-in-out",
          isActive
            ? "text-primary-600 dark:text-primary-400"
            : "text-gray-800 hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950 dark:text-dark-200 dark:hover:bg-dark-300/10 dark:hover:text-dark-50 dark:focus:bg-dark-300/10",
        )}
      >
        <div
          data-menu-active={isActive}
          className="flex min-w-0 items-center justify-between gap-2.5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={clsx(
                isActive
                  ? "bg-primary-600 opacity-80 dark:bg-primary-400"
                  : "opacity-50 transition-all",
                "size-2 rounded-full border border-current",
              )}
            />
            <span className="truncate">{label}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
