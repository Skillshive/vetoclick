// Import Dependencies
import { type Table } from "@tanstack/react-table";
// Local Imports
import {
  Pagination,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
  Select,
} from "@/components/ui";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

export function PaginationSection({ table }: { table: Table<any> }) {
  const paginationState = table.getState().pagination;
  const { isXl, is2xl } = useBreakpointsContext();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div className="text-xs-plus flex items-center space-x-2 rtl:space-x-reverse">
        <span>{t('common.show')}</span>
        <Select
          data={[10, 20, 30, 40, 50, 100]}
          value={paginationState.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          classNames={{
            root: "w-fit",
            select: "h-7 rounded-full py-1 text-xs ltr:pr-7! rtl:pl-7!",
          }}
        />
        <span>{t('common.entries')}</span>
      </div>
      <div>
        <Pagination
          total={table.getPageCount()}
          value={paginationState.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
          siblings={isXl ? 2 : is2xl ? 3 : 1}
          boundaries={isXl ? 2 : 1}
        >
          <PaginationPrevious />
          <PaginationItems />
          <PaginationNext />
        </Pagination>
      </div>
      <div className="text-xs-plus truncate">
        {t('common.showing')} {paginationState.pageIndex * paginationState.pageSize + 1} -{" "}
        {Math.min(
          (paginationState.pageIndex + 1) * paginationState.pageSize,
          table.getCoreRowModel().rows.length
        )}{" "}
        {t('common.of')} {table.getCoreRowModel().rows.length} {t('common.entries')}
      </div>
    </div>
  );
}