import { Table } from '@tanstack/react-table';
import { Order, Supplier } from './types';
import { Button, Input } from '@/components/ui';
import { HiSearch } from 'react-icons/hi';
import { useTranslation } from '@/hooks/useTranslation';
import { useBreakpointsContext } from '@/contexts/breakpoint/context';
import { TableSettings } from '@/components/shared/table/TableSettings';
import { ResponsiveFilter } from '@/components/shared/table/ResponsiveFilter';
import { FacedtedFilter } from '@/components/shared/table/FacedtedFilter';
import { CheckCircleIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { CSSProperties } from 'react';

interface ToolbarProps {
  table: Table<Order>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  suppliers: Supplier[];
}

export function Toolbar({
  table,
  globalFilter,
  setGlobalFilter,
  suppliers,
}: ToolbarProps) {
  const { t } = useTranslation();
  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

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
            
            {table.getColumn('status') && (
              <FacedtedFilter
                column={table.getColumn('status')!}
                title={t('common.status') || 'Status'}
                options={[
                  { value: 'draft', label: t('common.draft') || 'Draft' },
                  { value: 'pending', label: t('common.pending') || 'Pending' },
                  { value: 'confirmed', label: t('common.confirmed') || 'Confirmed' },
                  { value: 'shipped', label: t('common.shipped') || 'Shipped' },
                  { value: 'received', label: t('common.received') || 'Received' },
                  { value: 'cancelled', label: t('common.cancelled') || 'Cancelled' },
                  { value: 'returned', label: t('common.returned') || 'Returned' },
                ]}
                Icon={CheckCircleIcon}
              />
            )}

            {table.getColumn('supplier') && (
              <FacedtedFilter
                column={table.getColumn('supplier')!}
                title={t('common.supplier') || 'Supplier'}
                options={suppliers.map(supplier => ({
                  value: supplier.name,
                  label: supplier.name,
                }))}
                Icon={BuildingStorefrontIcon}
              />
            )}
            
            {table.getState().columnFilters.length > 0 && (
              <Button
                onClick={() => table.resetColumnFilters()}
                variant="outlined"
                className="h-8 px-2.5 text-xs whitespace-nowrap"
              >
                {t('common.reset_filters') || 'Reset Filters'}
              </Button>
            )}
          </div>

          <div className="flex shrink-0 space-x-2">
            <ResponsiveFilter
              anchor={{ to: "bottom end", gap: 12 }}
              buttonContent={
                <>
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
  table: Table<Order>; 
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
      placeholder={t('common.search_orders') || t('common.search')}
    />
  );
}

