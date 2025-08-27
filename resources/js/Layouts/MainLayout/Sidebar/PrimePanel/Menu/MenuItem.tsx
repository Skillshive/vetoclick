// Import Dependencies
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "@inertiajs/react";

// Local Imports
import { Badge } from "@/components/ui";
import { NavigationTree } from "@/@types/navigation";
import { ColorType } from "@/constants/app";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useSidebarContext } from "@/contexts/sidebar/context";

// ----------------------------------------------------------------------

export function MenuItem({ data }: { data: NavigationTree  }) {
  const { path, transKey, id, title: defaultTitle } = data;

  const { t } = useTranslation();
  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();
  const title = t(transKey ?? "") || defaultTitle;

  // Remove useRouteLoaderData since we're not using React Router
  // const info = useRouteLoaderData("root")?.[id]?.info as
  //   | { val?: string; color?: ColorType }
  //   | undefined;

  const handleMenuItemClick = () => {
    if (lgAndDown) close();
  };

  return (
    <Link
      href={path as string}
      onClick={handleMenuItemClick}
      className={clsx(
        "outline-hidden transition-colors duration-300 ease-in-out block",
        "text-gray-600 hover:text-gray-900 dark:text-dark-200 dark:hover:text-dark-50",
      )}
    >
      <div
        data-menu-active={true}
        style={{ height: "34px" }}
        className="flex items-center justify-between text-xs-plus tracking-wide"
      >
        <span className="mr-1 truncate">{title}</span>
        {/* Remove info badge for now since we don't have the data */}
        {/* {info?.val && (
          <Badge
            color={info.color}
            variant="soft"
            className="h-4.5 min-w-[1rem] shrink-0 p-[5px] text-tiny-plus"
          >
            {info.val}
          </Badge>
        )} */}
      </div>
    </Link>
  );
}
