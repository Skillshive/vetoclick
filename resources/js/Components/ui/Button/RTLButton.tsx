// Import Dependencies
import { ElementType, ReactNode, forwardRef, ForwardedRef } from "react";
import clsx from "clsx";

// Local Imports
import { useRTL } from "@/hooks/useRTL";
import { Button, ButtonProps } from "./index";
import {
  PolymorphicComponentProps,
  PolymorphicRef,
} from "@/@types/polymorphic";

// ----------------------------------------------------------------------

export type RTLButtonOwnProps<E extends ElementType = "button"> = {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconPosition?: 'left' | 'right' | 'start' | 'end';
} & ButtonProps<E>;

export type RTLButtonProps<E extends ElementType = "button"> =
  PolymorphicComponentProps<E, RTLButtonOwnProps<E>>;

const RTLButtonInner = forwardRef(
  <E extends ElementType = "button">(
    props: any,
    ref: ForwardedRef<any>
  ) => {
    const {
      leftIcon,
      rightIcon,
      iconPosition = 'start',
      children,
      className,
      ...rest
    } = props as RTLButtonProps<E>;

    const { isRtl, rtlClasses } = useRTL();

    // Determine icon placement based on RTL and iconPosition
    const getIconPlacement = () => {
      if (iconPosition === 'start') {
        return isRtl ? 'right' : 'left';
      } else if (iconPosition === 'end') {
        return isRtl ? 'left' : 'right';
      }
      return iconPosition;
    };

    const iconPlacement = getIconPlacement();
    const startIcon = iconPlacement === 'left' ? leftIcon : rightIcon;
    const endIcon = iconPlacement === 'left' ? rightIcon : leftIcon;

    return (
      <Button
        ref={ref}
        className={clsx(
          // RTL-aware flex direction
          isRtl && 'flex-row-reverse',
          className
        )}
        {...rest}
      >
        {startIcon && (
          <span className={clsx(
            'inline-flex items-center',
            children && (isRtl ? rtlClasses.ml('2') : rtlClasses.mr('2'))
          )}>
            {startIcon}
          </span>
        )}
        {children}
        {endIcon && (
          <span className={clsx(
            'inline-flex items-center',
            children && (isRtl ? rtlClasses.mr('2') : rtlClasses.ml('2'))
          )}>
            {endIcon}
          </span>
        )}
      </Button>
    );
  }
);

type RTLButtonComponent = (<E extends ElementType = "button">(
  props: RTLButtonProps<E> & { ref?: PolymorphicRef<E> },
) => ReactNode) & { displayName?: string };

const RTLButton = RTLButtonInner as RTLButtonComponent;
RTLButton.displayName = "RTLButton";

export { RTLButton };