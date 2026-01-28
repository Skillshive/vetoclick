import { Table } from '@tanstack/react-table';
import { Appointment, Client } from './types';
import { Button, Input } from '@/components/ui';
import {  HiSearch } from 'react-icons/hi';
import { useTranslation } from '@/hooks/useTranslation';
import { useBreakpointsContext } from '@/contexts/breakpoint/context';
import { TableSettings } from '@/components/shared/table/TableSettings';
import { ResponsiveFilter } from '@/components/shared/table/ResponsiveFilter';
import clsx from 'clsx';
import { CSSProperties, useMemo, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { ViewColumnsIcon, UserIcon, ClipboardDocumentCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface ToolbarProps {
  table: Table<Appointment>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  clients: Client[];
  statuses: { [key: number]: string };
  user?: any;
}

export function Toolbar({
  table,
  globalFilter,
  setGlobalFilter,
  clients,
  statuses,
  user,
}: ToolbarProps) {
  const { t } = useTranslation();
  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

  // Check if user is a client
  const isClient = useMemo(() => {
    if (!user) return false;
    
    // Check if user has client property
    if (user.client !== null && user.client !== undefined) {
      return true;
    }
    
    // Check if user has client role
    if (user.role) {
      const role = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
      return role === 'client';
    }
    
    // Check if user has client in roles array
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some((r: any) => {
        const roleName = typeof r === 'string' ? r.toLowerCase() : (r?.name?.toLowerCase() || '');
        return roleName === 'client';
      });
    }
    
    return false;
  }, [user]);

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
            <Filters table={table}  clients={clients} statuses={statuses} />
            {isClient && (
              <Button
                onClick={() => router.visit(route('appointments.create'))}
                color="primary"
                className="h-8 gap-2 px-3 text-xs whitespace-nowrap"
              >
                <PlusIcon className="size-4" />
                <span>{t('common.create_appointment') || 'Create Appointment'}</span>
              </Button>
            )}
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
            <Filters table={table} clients={clients} statuses={statuses} />
          </div>

          <div className="flex shrink-0 space-x-2">
            {isClient && (
              <Button
                onClick={() => router.visit(route('appointments.create'))}
                color="primary"
                className="h-8 gap-2 px-3 text-xs whitespace-nowrap"
              >
                <PlusIcon className="size-4" />
                <span>{t('common.create_appointment') || 'Create Appointment'}</span>
              </Button>
            )}
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
  table: Table<Appointment>; 
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
      placeholder={t('common.search_appointments')}
    />
  );
}

function Filters({ 
  table, 
  clients,
  statuses
}: { 
  table: Table<Appointment>; 
  clients: Client[];
  statuses: { [key: number]: string };
}) {
  const { t } = useTranslation();

  const clientOptions = clients.map(client => ({
    value: client.id.toString(),
    label: `${client.first_name} ${client.last_name}`,
  }));

  const statusOptions = Object.entries(statuses).map(([value, label]) => ({
    value,
    label,
  }));

  const handleFilterChange = (filterType: string, value: string[]) => {
    const params = new URLSearchParams(window.location.search);
    
    if (value.length > 0) {
      params.set(filterType, value.join(','));
    } else {
      params.delete(filterType);
    }
    
    params.set('page', '1');
    
    router.get(`${window.location.pathname}?${params.toString()}`, {
      preserveState: true,
      replace: true,
    });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('vet');
    params.delete('client');
    params.delete('status');
    params.set('page', '1');
    
    router.get(`${window.location.pathname}?${params.toString()}`, {
      preserveState: true,
      replace: true,
    });
  };

  const urlParams = new URLSearchParams(window.location.search);
  const hasActiveFilters = urlParams.has('vet') || urlParams.has('client') || urlParams.has('status');

  return (
    <>
      <ServerSideFilter
        options={clientOptions}
        title={t('common.filter_client')}
        filterKey="client"
        onFilterChange={handleFilterChange}
        currentValue={urlParams.get('client')?.split(',') || []}
        icon={<UserIcon className="size-4" />}
      />

      <ServerSideFilter
        options={statusOptions}
        title={t('common.filter_status')}
        filterKey="status"
        onFilterChange={handleFilterChange}
        currentValue={urlParams.get('status')?.split(',') || []}
        icon={<ClipboardDocumentCheckIcon className="size-4" />}
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

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
      <PopoverPanel
  transition
  anchor={{ to: "bottom start", gap: 12 }}
  className="ring-primary-500/50 dark:border-dark-500 dark:bg-dark-750 z-100 flex w-fit flex-col rounded-md border border-gray-300 bg-white shadow-lg shadow-gray-200/50 outline-hidden focus-visible:ring-3 focus-visible:outline-hidden dark:shadow-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
>
            <div className="flex flex-col overflow-hidden">
            <div className="p-2">
                <Input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
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
</PopoverPanel>          </>
        )}
    </Popover>
  );
}