import {
  Dispatch,
  SetStateAction,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { RiFilter3Line } from "react-icons/ri";

// Local Imports
import { Button, Input } from "@/components/ui";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";

// ----------------------------------------------------------------------

type ToolbarProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

export function Toolbar({ query, setQuery }: ToolbarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const { isXs } = useBreakpointsContext();

  useLayoutEffect(() => {
    mobileSearchRef?.current?.focus();
  }, [showMobileSearch]);

  return (
    <div className="flex items-center justify-between py-5 lg:py-6">
      {showMobileSearch && isXs ? (
        <Input
          classNames={{
            root: "flex-1",
            input: "text-xs-plus h-9",
          }}
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Users ..."
          className=""
          prefix={<MagnifyingGlassIcon className="size-4.5" />}
          suffix={
            <Button
              variant="flat"
              className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
              onClick={() => {
                setQuery("");
                setShowMobileSearch(false);
              }}
            >
              <XMarkIcon className="dark:text-dark-200 size-4.5 text-gray-500" />
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center space-x-1">
            <h2 className="dark:text-dark-50 truncate text-xl font-medium text-gray-700 lg:text-2xl">
Breeds            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <Input
              classNames={{
                input: "text-xs-plus h-9 rounded-full",
                root: "max-sm:hidden",
              }}
              value={query || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Users ..."
              className=""
              prefix={<MagnifyingGlassIcon className="size-4.5" />}
            />
          </div>
        </>
      )}
    </div>
  );
}