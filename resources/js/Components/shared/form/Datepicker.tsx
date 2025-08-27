// Import Dependencies
import { CalendarIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { forwardRef, useEffect, useRef, useState } from "react";
import { BaseOptions } from "flatpickr/dist/types/options";
import Flatpickr from "react-flatpickr";
import flatpickrCSS from "flatpickr/dist/themes/light.css?inline";

// Local Imports
import { Input, InputProps } from "@/components/ui";
import { useMergedRef } from "@/hooks";
import { injectStyles, insertStylesToHead, makeStyleTag } from "@/utils/dom/injectStylesToHead";
import { FlatpickrProps, FlatpickrRef } from "./Flatpickr";

// ----------------------------------------------------------------------

// Define prop types for the DatePicker component
interface DatePickerProps
  extends Omit<FlatpickrProps, "options">,
    Omit<
      InputProps<"input">,
      "defaultValue" | "value" | "onChange" | "prefix" | "type"
    > {
  options?: Partial<BaseOptions>;
  isCalendar?: boolean;
  hasCalenderIcon?: boolean;
}

const styles = `@layer vendor {
  ${flatpickrCSS}
}`;

const sheet = makeStyleTag();

injectStyles(sheet, styles);
insertStylesToHead(sheet);

const DatePicker = forwardRef<FlatpickrRef, DatePickerProps>(
  (
    {
      options: userOptions,
      className,
      isCalendar = false,
      hasCalenderIcon = true,
      ...props
    },
    ref,
  ) => {
    const flatpickrRef = useRef<FlatpickrRef | null>(null);

    const options = {
      inline: isCalendar,
      locale: "fr",
      ...userOptions,
    };

    const mergedRef = useMergedRef(flatpickrRef, ref);

    useEffect(() => {
      const calendarContainer =
        flatpickrRef.current?._flatpickr?.calendarContainer;
      if (calendarContainer) {
        calendarContainer.classList.toggle("is-calendar", isCalendar);
      }
    }, [isCalendar]);

    return (
      <Flatpickr
        className={clsx("cursor-pointer", isCalendar && "hidden", className)}
        options={options}
        ref={mergedRef}
        {...props}
        render={(props: any, ref: any) => {
          const { render, ...inputProps } = props;
          return isCalendar ? (
            <input ref={ref} readOnly {...inputProps} />
          ) : (
            <Input
              ref={ref}
              prefix={
                !userOptions?.inline &&
                hasCalenderIcon && <CalendarIcon className="size-5" />
              }
              readOnly
              {...inputProps}
            />
          );
        }}
      />
    );
  },
);

export { DatePicker };
