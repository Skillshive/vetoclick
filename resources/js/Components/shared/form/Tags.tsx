// Import Dependencies
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  forwardRef,
  useState,
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
} from "react";

// Local Imports
import { InputErrorMsg } from "@/components/ui";

// ----------------------------------------------------------------------

interface TagItem {
  id: string;
  value: string;
}

export interface TagsProps {
  onChange: (tags: TagItem[]) => void;
  value: TagItem[];
  error?: boolean | ReactNode;
  label?: ReactNode;
  placeholder?: string;
  leftIcon?: ReactNode;
}

const Tags = forwardRef<HTMLElement, TagsProps>(
  ({ onChange, value, error, label, placeholder, leftIcon, ...rest }, ref) => {
    const [query, setQuery] = useState("");

    return (
      <div className="flex flex-col" ref={ref as React.Ref<HTMLDivElement>} {...rest}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          <div
            className={clsx(
              "relative w-full cursor-text overflow-hidden rounded-lg border py-2 text-start transition-colors focus-within:outline-none",
              leftIcon ? "ltr:pl-9 rtl:pr-9 ltr:pr-3 rtl:pl-3" : "px-3",
              error
                ? "border-error dark:border-error-lighter"
                : "focus-within:border-primary-600 dark:border-dark-450 dark:focus-within:border-primary-500 dark:hover:border-dark-400 border-gray-300 hover:border-gray-400",
            )}
            onClick={(e) => {
              // Focus the input when clicking on the container
              const input = e.currentTarget.querySelector('input');
              if (input && e.target !== input) {
                input.focus();
              }
            }}
          >
            {leftIcon && (
              <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 flex items-center ltr:pl-3 rtl:pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                {leftIcon}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 items-center">
              {value.length > 0 &&
                value.map((val: TagItem) => (
                  <button
                    key={val.id}
                    type="button"
                    className="group cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newTags = value.filter(tag => tag.id !== val.id);
                      onChange(newTags);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <span>{val.value}</span>
                    <XMarkIcon className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

              {placeholder && value.length === 0 && query === "" && (
                <span 
                  className={clsx(
                    "pointer-events-none absolute top-1/2 -translate-y-1/2 py-2 text-gray-400",
                    leftIcon ? "ltr:left-9 rtl:right-9 ltr:pl-0 rtl:pr-0" : "ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3"
                  )}
                >
                  {placeholder}
                </span>
              )}

              <input
                type="text"
                className="flex-1 min-w-[120px] outline-none bg-transparent border-0 focus:ring-0 p-0"
                autoComplete="off"
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  // Handle Enter key to add tag
                  if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    const trimmedQuery = query.trim();
                    if (trimmedQuery !== "") {
                      const newTag: TagItem = {
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        value: trimmedQuery,
                      };
                      onChange([...value, newTag]);
                      setQuery("");
                    }
                    return;
                  }
                  
                  // Handle Backspace to remove last tag when input is empty
                  if (
                    value.length > 0 &&
                    event.keyCode === 8 &&
                    (event.target as HTMLInputElement).value === ""
                  ) {
                    onChange(value.slice(0, -1));
                  }
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setQuery(event.target.value);
                }}
                value={query}
              />
            </div>
          </div>
          <InputErrorMsg when={!!error && typeof error !== "boolean"}>
            {error}
          </InputErrorMsg>
        </div>
      </div>
    );
  },
);

Tags.displayName = "Tags";

export { Tags };
