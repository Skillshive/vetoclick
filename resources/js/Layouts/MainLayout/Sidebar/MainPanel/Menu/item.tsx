// Import Dependencies
import { ElementType, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

// Local Imports
import { Badge } from "@/components/ui";
import { createScopedKeydownHandler } from "@/utils/dom/createScopedKeydownHandler";
import { ColorType } from "@/constants/app";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";

// ----------------------------------------------------------------------

export interface ItemProps {
  id: string;
  title: string;
  to?: string; 
  href?: string; 
  isActive?: boolean;
  icon?: ElementType;
  component?: ElementType;
  onClick?: (path: string) => void;
  onKeyDown?: ComponentPropsWithoutRef<"button">["onKeyDown"];
  info?: { val?: string; color?: ColorType };
}

export function Item({
  id,
  title,
  isActive,
  icon,
  component,
  onKeyDown,
  info,
  href,
  to,
  ...rest
}: ItemProps) {
const IconComponent = icon;

  if (!IconComponent) {
    return (
      <div
        data-root-menu-item
        className={clsx(
          "relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden transition-colors duration-200",
          isActive
            ? "bg-primary-600/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-400"
            : "hover:bg-primary-600/20 focus:bg-primary-600/20 active:bg-primary-600/25 dark:text-dark-200 dark:hover:bg-dark-300/20 dark:focus:bg-dark-300/20 dark:active:bg-dark-300/25 text-gray-500",
        )}
      >
        <div className="size-7 bg-gray-300 rounded" />
      </div>
    );
  }

  const Element = component || "button";
  const { lgAndUp } = useBreakpointsContext();

  return (
    <Element
      data-root-menu-item
      data-tooltip={lgAndUp ? true : undefined}
      data-tooltip-content={title}
      data-tooltip-place="right"
      className={clsx(
        "relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden transition-colors duration-200",
        isActive
          ? "bg-primary-600/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-400"
          : "hover:bg-primary-600/20 focus:bg-primary-600/20 active:bg-primary-600/25 dark:text-dark-200 dark:hover:bg-dark-300/20 dark:focus:bg-dark-300/20 dark:active:bg-dark-300/25 text-gray-500",
      )}
      onKeyDown={createScopedKeydownHandler({
        siblingSelector: "[data-root-menu-item]",
        parentSelector: "[data-root-menu]",
        activateOnFocus: false,
        loop: true,
        orientation: "vertical",
        onKeyDown,
      })}
      {...(href ? { href } : {})}
      {...(to && !href ? { href: to } : {})}
      {...rest}
    >
      <IconComponent className="size-7" />
      {info?.val && (
        <Badge
          color={info.color}
          className="text-tiny-plus dark:ring-dark-800 absolute top-0 right-0 -m-1 h-4 min-w-[1rem] rounded-full px-1 py-0 ring-1 ring-white"
        >
          <span>{info.val}</span>
        </Badge>
      )}
    </Element>
  );
}
