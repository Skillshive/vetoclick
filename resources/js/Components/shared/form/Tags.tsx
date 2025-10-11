// Import Dependencies
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  forwardRef,
  Fragment,
  useState,
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
} from "react";

// Local Imports
import { Input, InputErrorMsg, Tag } from "@/components/ui";
import { randomId } from "@/utils/randomId";

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
}

const Tags = forwardRef<HTMLElement, TagsProps>(
  ({ onChange, value, error, label, placeholder, ...rest }, ref) => {
    const [query, setQuery] = useState("");

    const onChangeList = (list: TagItem[]) => {
      if (list[list.length - 1].value !== "") {
        onChange(list);
        setQuery("");
      }
    };

    return (
      <Combobox
        onChange={onChangeList}
        value={value}
        multiple
        as="div"
        className="flex flex-col"
        ref={ref}
        {...rest}
      >
        {({ open, value: selectedValue }) => (
          <>
            {label && <Label>{label}</Label>}

            <div className="relative mt-1">
              <div>
                <div
                  className={clsx(
                    "relative w-full cursor-default overflow-hidden rounded-lg border px-3 py-2 text-start outline-hidden transition-colors focus:outline-hidden ltr:pr-9 rtl:pl-9",
                    error
                      ? "border-error dark:border-error-lighter"
                      : "focus-within:border-primary-600! dark:border-dark-450 dark:focus-within:border-primary-500! dark:hover:border-dark-400 border-gray-300 hover:border-gray-400",
                  )}
                  onClick={(e) => {
                    console.log('Container clicked:', e.target);
                    // Check if the click is on a tag button
                    const clickedElement = e.target as HTMLElement;
                    const isTagClick = clickedElement.tagName === 'BUTTON' || clickedElement.closest('button');
                    
                    if (isTagClick) {
                      console.log('Tag button clicked, preventing default');
                      e.preventDefault();
                      e.stopPropagation();
                      return; // Don't open the dropdown
                    }
                    
                    console.log('Not a tag click, allowing default behavior');
                  }}
                >
                  <ul className="flex flex-wrap gap-1.5">
                    {selectedValue.length > 0 &&
                      selectedValue.map((val: TagItem) => (
                        <li key={val.id}>
                          <button
                            type="button"
                            className="group cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Tag clicked for removal:', val.value);
                              const newTags = selectedValue.filter(tag => tag.id !== val.id);
                              console.log('New tags after removal:', newTags);
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
                        </li>
                      ))}

                    {placeholder && value.length === 0 && query === "" && (
                      <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 px-3 py-2 ltr:left-0 rtl:right-0">
                        {placeholder}
                      </span>
                    )}

                    <ComboboxButton
                      as="div"
                      className="flex-1"
                    >
                      <ComboboxInput
                        as={Input}
                        unstyled
                        classNames={{
                          root: "flex-1",
                        }}
                        displayValue={(item: TagItem) => item.value}
                        autoComplete="off"
                        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                          if (
                            value.length > 0 &&
                            event.keyCode === 8 &&
                            (event.target as HTMLInputElement).value === ""
                          ) {
                            onChange(value.slice(0, -1));
                          }
                        }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setQuery(event.target.value.trim());
                        }}
                        value={query}
                      />
                    </ComboboxButton>
                  </ul>
                  <div className="absolute inset-y-0 flex cursor-pointer items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2">
                    <ChevronDownIcon
                      className={clsx(
                        "dark:text-dark-300 size-5 text-gray-400 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <InputErrorMsg when={!!error && typeof error !== "boolean"}>
                  {error}
                </InputErrorMsg>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <ComboboxOptions className="dark:border-dark-500 dark:bg-dark-700 absolute z-10 max-h-60 w-full overflow-x-hidden overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:shadow-none">
                  <ComboboxOption
                    className={({ selected, focus }) =>
                      clsx(
                        "relative cursor-pointer px-4 py-2 outline-hidden transition-colors select-none",
                        focus && !selected && "dark:bg-dark-600 bg-gray-100",
                        selected
                          ? "bg-primary-600 dark:bg-primary-500 text-white"
                          : "dark:text-dark-100 text-gray-800",
                      )
                    }
                    value={{ id: randomId(), value: query }}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          Value: {query}
                        </span>
                      </>
                    )}
                  </ComboboxOption>
                </ComboboxOptions>
              </Transition>
            </div>
          </>
        )}
      </Combobox>
    );
  },
);

Tags.displayName = "Tags";

export { Tags };
