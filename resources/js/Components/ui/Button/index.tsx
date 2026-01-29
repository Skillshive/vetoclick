// Import Dependencies
import { ElementType, ReactNode, forwardRef, ForwardedRef } from "react";
import clsx from "clsx";

// Local Imports
import { ColorType } from "@/constants/app";
import { setThisClass } from "@/utils/setThisClass";
import {
  PolymorphicRef,
  PolymorphicComponentProps,
} from "@/@types/polymorphic";

// ----------------------------------------------------------------------

type Variant = "filled" | "outlined" | "soft" | "flat";

type ButtonOwnProps<E extends ElementType = "button"> = {
  children?: ReactNode;
  color?: ColorType;
  isIcon?: boolean;
  variant?: Variant;
  unstyled?: boolean;
  isGlow?: boolean;
  component?: E;
}

export type ButtonProps<E extends ElementType = "button"> =
  PolymorphicComponentProps<E, ButtonOwnProps<E>>;

const variants: Record<Variant, string> = {
  filled:
  "bg-this text-white hover:bg-this-darker focus:bg-this-darker active:bg-this-darker/90 disabled:bg-this-light disabled:text-this-darker/50 dark:disabled:bg-this-darker dark:disabled:text-this-lighter/50",
   soft: "text-this-darker bg-this-darker/[.08] hover:bg-this-darker/[.15] focus:bg-this-darker/[.15] active:focus:bg-this-darker/20 dark:bg-this-lighter/10 dark:text-this-lighter dark:hover:bg-this-lighter/20 dark:focus:bg-this-lighter/20 dark:active:bg-this-lighter/25",
  outlined:
    "text-this-darker border border-this-darker hover:bg-this-darker/[.05] focus:bg-this-darker/[.05] active:bg-this-darker/10 dark:border-this-lighter dark:text-this-lighter dark:hover:bg-this-lighter/[.05] dark:focus:bg-this-lighter/[.05] dark:active:bg-this-lighter/10",
  flat: "text-this-darker hover:bg-this-darker/[.08] focus:bg-this-darker/[.08] active:bg-this-darker/[.15] dark:text-this-lighter dark:hover:bg-this-lighter/10 dark:focus:bg-this-lighter/10 dark:active:bg-this-lighter/[.15]",
};

const primaryVariants: Record<Variant, string> = {
  filled:
  "bg-[#15A093] text-white hover:bg-[#0F7A70] focus:bg-[#0F7A70] active:bg-[#0F7A70]/90 disabled:bg-[#4DB9AD]/30 disabled:text-white/60 dark:disabled:bg-[#1B2441] dark:disabled:text-[#4DB9AD]/60", 
  soft: "text-[#15A093] bg-[#15A093]/[.12] hover:bg-[#15A093]/[.20] focus:bg-[#15A093]/[.20] active:bg-[#15A093]/25 dark:bg-[#15A093]/15 dark:text-[#4DB9AD] dark:hover:bg-[#15A093]/25 dark:focus:bg-[#15A093]/25 dark:active:bg-[#15A093]/30",
  outlined:
    "text-[#15A093] border-2 border-[#15A093] hover:bg-[#15A093]/[.08] focus:bg-[#15A093]/[.08] active:bg-[#15A093]/12 dark:border-[#4DB9AD] dark:text-[#4DB9AD] dark:hover:bg-[#4DB9AD]/[.08] dark:focus:bg-[#4DB9AD]/[.08] dark:active:bg-[#4DB9AD]/12",
  flat: "text-[#15A093] hover:bg-[#15A093]/[.12] focus:bg-[#15A093]/[.12] active:bg-[#15A093]/[.20] dark:text-[#4DB9AD] dark:hover:bg-[#4DB9AD]/15 dark:focus:bg-[#4DB9AD]/15 dark:active:bg-[#4DB9AD]/20",
};

const neutralVariants: Record<Variant, string> = {
  filled:
  "bg-gray-150 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200/80 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 dark:focus:bg-surface-1 dark:active:bg-surface-1/90 dark:disabled:bg-dark-600 dark:disabled:text-dark-400", soft: "bg-gray-150/30 text-gray-900 hover:bg-gray-200/[.15] focus:bg-gray-200/[.15] active:bg-gray-200/20 dark:bg-dark-500/30 dark:text-dark-50 dark:hover:bg-dark-450/[.15] dark:focus:bg-dark-450/[.15] dark:active:bg-dark-450/20",
  outlined:
    "border border-gray-300 hover:bg-gray-300/20 focus:bg-gray-300/20 text-gray-900 active:bg-gray-300/25 dark:text-dark-50 dark:hover:bg-dark-300/20 dark:focus:bg-dark-300/20 dark:active:bg-dark-300/25 dark:border-dark-450",
  flat: "hover:bg-gray-300/20 focus:bg-gray-300/20 text-gray-700 active:bg-gray-300/25 dark:text-dark-200 dark:hover:bg-dark-300/10 dark:focus:bg-dark-300/10 dark:active:bg-dark-300/20",
};

const ButtonInner = forwardRef(
  <E extends ElementType = "button">(
    props: any,
    ref: ForwardedRef<any>,
  ) => {
    const {
      component,
      className,
      children,
      color = "neutral",
      isIcon = false,
      variant = "filled",
      unstyled = false,
      isGlow = false,
      type: buttonType,
      ...rest
    } = props as ButtonProps<E>;
    const Component = component || "button";
    const { disabled, ...propsRest } = rest;

    const type = Component === "button" ? buttonType || "button" : undefined;

    return (
      <Component
        ref={ref}
        type={type}
        className={clsx(
          "btn-base",
          !unstyled
            ? [
              "btn",
              isIcon && "shrink-0 p-0",
              color === "neutral"
                ? [
                  neutralVariants[variant],
                  isGlow &&
                  "dark:shadow-dark-450/5 shadow-lg shadow-gray-200/50",
                ]
                : color === "primary"
                ? [
                  primaryVariants[variant],
                  isGlow &&
                  "shadow-soft shadow-[#4DB9AD]/50 dark:shadow-[#4DB9AD]/50 dark:shadow-lg",
                ]
                : [
                  setThisClass(color),
                  variants[variant],
                  isGlow &&
                  "shadow-soft shadow-this/50 dark:shadow-this/50 dark:shadow-lg",
                ],
            ]
            : color !== "neutral" && setThisClass(color),
          className,
        )}
        disabled={Component === "button" ? disabled : undefined}
        data-disabled={disabled}
        {...propsRest}
      >
        {children}
      </Component>
    );
  },
);

type ButtonComponent = (<E extends ElementType = "button">(
  props: ButtonProps<E> & { ref?: PolymorphicRef<E> },
) => ReactNode) & { displayName?: string };

const Button = ButtonInner as ButtonComponent;
Button.displayName = "Button";

export { Button };
