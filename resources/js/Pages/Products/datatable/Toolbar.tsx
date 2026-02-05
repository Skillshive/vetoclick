import { Table } from '@tanstack/react-table';
import { Product, Category } from './types';
import { Button, Input } from '@/components/ui';
import { HiPlus, HiSearch, HiDownload, HiPrinter } from 'react-icons/hi';
import { ChevronUpDownIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { TbUpload } from 'react-icons/tb';
import { useTranslation } from '@/hooks/useTranslation';
import { useBreakpointsContext } from '@/contexts/breakpoint/context';
import { DateFilter } from '@/components/shared/table/DateFilter';
import { FacedtedFilter } from '@/components/shared/table/FacedtedFilter';
import { RangeFilter } from '@/components/shared/table/RangeFilter';
import { TableSettings } from '@/components/shared/table/TableSettings';
import { ResponsiveFilter } from '@/components/shared/table/ResponsiveFilter';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import clsx from 'clsx';
import { CSSProperties, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { ViewColumnsIcon } from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';
import { BiCategory } from "react-icons/bi";
import { MdCategory, MdOutlineCategory } from 'react-icons/md';
import { FaFilter } from 'react-icons/fa6';
import { CiFilter } from 'react-icons/ci';
import { Filter, TypeIcon, TypeOutline } from 'lucide-react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface ToolbarProps {
  table: Table<Product>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  categories: Category[];
}

export function Toolbar({
  table,
  globalFilter,
  setGlobalFilter,
  categories,
}: ToolbarProps) {
  const { t } = useTranslation();
  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

  // Product type options for filtering with translations
  const productTypeOptions = [
    { value: '1', label: t('common.product_type_medication') },
    { value: '2', label: t('common.product_type_vaccine') },
    { value: '3', label: t('common.product_type_supplement') },
    { value: '4', label: t('common.product_type_equipment') },
    { value: '5', label: t('common.product_type_food') },
  ];

  // Product status options for filtering with translations
  const productStatusOptions = [
    { value: '1', label: t('common.product_status_available') },
    { value: '2', label: t('common.product_status_out_of_stock') },
    { value: '4', label: t('common.product_status_on_order') },
  ];

  const handleExport = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('export', 'csv');
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="table-toolbar">
      {isXs ? (
        <>
          <div
            className={clsx(
              "flex space-x-2 pt-4 [&_.input-root]:flex-1",
              isFullScreenEnabled ? "px-4 sm:px-5" : "",
            )}
          >
            <SearchInput table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            <ResponsiveFilter
              anchor={{ to: "bottom end", gap: 12 }}
              buttonContent={
                <>
                  <ViewColumnsIcon className="size-4" />
                  <span>{t('common.view')}</span>
                </>
              }
              classNames={{
                button: "border-solid! h-8 gap-2 rounded-md px-3 text-xs",
              }}
            >
              {isXs ? (
                <div className="dark:border-dark-500 mx-auto flex h-12 w-full shrink-0 items-center justify-between border-b border-gray-200 px-3">
                  <p className="dark:text-dark-50 truncate text-start text-base font-medium text-gray-800">
                    {t('common.table_view')}
                  </p>
                </div>
              ) : (
                <h3 className="text-sm-plus dark:text-dark-100 px-3 pt-2.5 font-medium tracking-wide text-gray-800">
                  {t('common.table_view')}
                </h3>
              )}

              <div className="flex flex-col max-sm:overflow-hidden sm:w-64">
                <TableSettings table={table} />
              </div>
            </ResponsiveFilter>
          </div>
          <div
            className={clsx(
              "hide-scrollbar flex shrink-0 space-x-2 overflow-x-auto pt-4 pb-1",
              isFullScreenEnabled ? "px-4 sm:px-5" : "",
            )}
          >
            <Filters table={table} categories={categories} productTypeOptions={productTypeOptions} productStatusOptions={productStatusOptions} />
          </div>
        </>
      ) : (
        <div
          className={clsx(
            "custom-scrollbar transition-content flex justify-between space-x-4 overflow-x-auto pt-4 pb-1",
            isFullScreenEnabled ? "px-4 sm:px-5" : "",
          )}
          style={
            {
              "--margin-scroll": isFullScreenEnabled
                ? "1.25rem"
                : "var(--margin-x)",
            } as CSSProperties
          }
        >
          <div className="flex shrink-0 space-x-2">
            <SearchInput table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            <Filters table={table} categories={categories} productTypeOptions={productTypeOptions} productStatusOptions={productStatusOptions} />
          </div>

          <div className="flex shrink-0 space-x-2">
            <ResponsiveFilter
              anchor={{ to: "bottom end", gap: 12 }}
              buttonContent={
                <>
                  <ViewColumnsIcon className="size-4" />
                  <span>{t('common.view')}</span>
                </>
              }
              classNames={{
                button: "border-solid! h-8 gap-2 rounded-md px-3 text-xs",
              }}
            >
              {isXs ? (
                <div className="dark:border-dark-500 mx-auto flex h-12 w-full shrink-0 items-center justify-between border-b border-gray-200 px-3">
                  <p className="dark:text-dark-50 truncate text-start text-base font-medium text-gray-800">
                    {t('common.table_view')}
                  </p>
                </div>
              ) : (
                <h3 className="text-sm-plus dark:text-dark-100 px-3 pt-2.5 font-medium tracking-wide text-gray-800">
                  {t('common.table_view')}
                </h3>
              )}

              <div className="flex flex-col max-sm:overflow-hidden sm:w-64">
                <TableSettings table={table} />
              </div>
            </ResponsiveFilter>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchInput({ 
  table, 
  globalFilter, 
  setGlobalFilter 
}: { 
  table: Table<Product>; 
  globalFilter: string; 
  setGlobalFilter: (filter: string) => void; 
}) {

  const { t } = useTranslation();

  return (
    <Input
      value={globalFilter}
      onChange={(e) => setGlobalFilter(e.target.value)}
      prefix={<HiSearch className="size-4" />}
      classNames={{
        input: "ring-primary-500/50 h-8 text-xs focus:ring-3",
        root: "shrink-0",
      }}
      placeholder={t('common.search_products')}
    />
  );
}

function Filters({ 
  table, 
  categories,
  productTypeOptions,
  productStatusOptions
}: { 
  table: Table<Product>; 
  categories: Category[]; 
  productTypeOptions: { value: string; label: string }[];
  productStatusOptions: { value: string; label: string }[];
}) {
  const { t } = useTranslation();
  
  // Convert categories to filter options
  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name,
  }));

  const handleFilterChange = (filterType: string, value: string[]) => {
    const params = new URLSearchParams(window.location.search);
    
    if (value.length > 0) {
      params.set(filterType, value.join(','));
    } else {
      params.delete(filterType);
    }
    
    // Reset to page 1 when filtering
    params.set('page', '1');
    
    router.get(`${window.location.pathname}?${params.toString()}`, {
      preserveState: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('category');
    params.delete('type');
    params.delete('status');
    params.delete('date_from');
    params.delete('date_to');
    params.set('page', '1');
    
    router.get(`${window.location.pathname}?${params.toString()}`, {
      preserveState: true,
      replace: true,
    });
  };

  // Check if any filters are active
  const urlParams = new URLSearchParams(window.location.search);
  const hasActiveFilters = urlParams.has('category') || urlParams.has('type') || urlParams.has('status') || urlParams.has('date_from') || urlParams.has('date_to');

  return (
    <>
      <ServerSideFilter
        options={categoryOptions}
        title={t('common.filter_category')}
        filterKey="category"
        onFilterChange={handleFilterChange}
        currentValue={urlParams.get('category')?.split(',') || []}
        icon={<BiCategory className="size-4" />}
        />

      <ServerSideFilter
        options={productTypeOptions}
        title={t('common.filter_type')}
        filterKey="type"
        onFilterChange={handleFilterChange}
        currentValue={urlParams.get('type')?.split(',') || []}
        icon={<MdOutlineCategory className="size-4" />}
      />

      <ServerSideFilter
        options={productStatusOptions}
        title={t('common.filter_status')}
        filterKey="status"
        onFilterChange={handleFilterChange}
        currentValue={urlParams.get('status')?.split(',') || []}
        icon={<Filter className="size-4" />}
      />

      {hasActiveFilters && (
        <Button
          onClick={resetFilters}
          className="h-8 px-2.5 text-xs whitespace-nowrap"
        >
          {t('common.reset_filters')}
        </Button>
      )}
    </>
  );
}

// Server-side filter component
interface ServerSideFilterProps {
  options: { value: string; label: string }[];
  title: string;
  filterKey: string;
  onFilterChange: (filterType: string, value: string[]) => void;
  currentValue: string[];
  icon?: React.ReactNode;
}

function ServerSideFilter({ 
  options, 
  title, 
  filterKey, 
  onFilterChange, 
  currentValue,
  icon
}: ServerSideFilterProps) {
  const { t } = useTranslation();

  const handleChange = (selectedValues: string[]) => {
    onFilterChange(filterKey, selectedValues);
  };

  const selectedItems = options.filter(option => currentValue.includes(option.value));

  return (
    <Popover>
      {({ open }) => (
        <>
          <PopoverButton
        as={Button}
        variant="outlined"
            className={clsx(
              "h-8 gap-2 px-2.5 text-xs whitespace-nowrap",
              open
                ? "border-primary-600 ring-primary-500/50 dark:border-primary-500 ring-3"
                : "border-dashed",
            )}
      >
         {icon && <span className="shrink-0">{icon}</span>}
        <span>{title}</span>
            {selectedItems.length > 0 && (
              <>
                <div className="h-full w-px bg-gray-300 dark:bg-dark-450" />
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-600">
                  {selectedItems.length}
          </span>
              </>
        )}
          </PopoverButton>
      <Transition
            as={PopoverPanel}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
            anchor={{ to: "bottom start", gap: 12 }}
            className="ring-primary-500/50 dark:border-dark-500 dark:bg-dark-750 z-100 flex w-fit flex-col rounded-md border border-gray-300 bg-white shadow-lg shadow-gray-200/50 outline-hidden focus-visible:ring-3 focus-visible:outline-hidden dark:shadow-none"
      >
            <div className="flex flex-col overflow-hidden">
        <div className="max-h-60 overflow-y-auto">
          {options.map((option) => (
                <label
                    key={option.value}
                    className="flex h-9 w-full cursor-pointer items-center px-3 tracking-wide outline-hidden transition-colors hover:bg-gray-100 dark:hover:bg-dark-600"
                >
                  <input
                    type="checkbox"
                    checked={currentValue.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleChange([...currentValue, option.value]);
                      } else {
                        handleChange(currentValue.filter(v => v !== option.value));
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
          ))}
        </div>
        {currentValue.length > 0 && (
          <>
            <hr className="border-gray-150 dark:border-dark-500 mx-3 my-1.5 h-px" />
                <button
                  onClick={() => handleChange([])}
                        className="flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors hover:bg-gray-100 dark:hover:bg-dark-600"
                      >
                        <span className="text-sm text-red-600">{t('common.clear_filter')} {title}</span>
                </button>
                </>
              )}
            </div>
          </Transition>
          </>
        )}
    </Popover>
  );
}