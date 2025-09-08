import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import { ResponsiveFilter } from "@/components/shared/table/ResponsiveFilter";
import { TableSettings } from "@/components/shared/table/TableSettings";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useTranslation } from "@/hooks/useTranslation";
import { Table as TanstackTable } from "@tanstack/react-table";

interface TableSettingsButtonProps<TData> {
  table: TanstackTable<TData>;
  className?: string;
}

export const TableSettingsButton = <TData,>({
  table,
  className
}: TableSettingsButtonProps<TData>) => {
  const { smAndDown } = useBreakpointsContext();
  const { t } = useTranslation();

  return (
    <ResponsiveFilter
      anchor={{ to: "bottom end", gap: 12 }}
      buttonContent={
        <>
          <ViewColumnsIcon className="size-4" />
          <span>{t('common.view')}</span>
        </>
      }
      classNames={{
        button: `border-solid! h-8 gap-2 rounded-md px-3 text-xs ${className || ""}`,
      }}
    >
      {smAndDown ? (
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
  );
};