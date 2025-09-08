import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { Table as TanstackTable } from "@tanstack/react-table";
import { useRef } from "react";

interface SearchInputProps<TData> {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void; // For backend search
  table?: TanstackTable<TData>;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput = <TData,>({
  value,
  onChange,
  onSearch,
  table,
  placeholder = "Search...",
  className,
  debounceMs = 300
}: SearchInputProps<TData>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If onSearch is provided, debounce the backend search
    if (onSearch) {
      timeoutRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    }

    // Also update the table's global filter if table is provided (for client-side filtering)
    if (table && !onSearch) {
      table.setGlobalFilter(newValue);
    }
  };

  return (
    <Input
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      placeholder={placeholder}
      classNames={{
        root: `shrink-0 ${className || ""}`,
        input: "ring-primary-500/50 h-8 text-xs focus:ring-3",
      }}
    />
  );
};