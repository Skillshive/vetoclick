import clsx from "clsx";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { Button, Input, Select } from "@/components/ui";
import { TableSettings } from "@/components/shared/table/TableSettings";
import { ResponsiveFilter } from "@/components/shared/table/ResponsiveFilter";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useTranslation } from "@/hooks/useTranslation";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { router } from "@inertiajs/react";
import type { OrdersDictionaries } from "@/types/Orders";
import { useMemo } from "react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface ToolbarProps {
  table: any;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  dictionaries: OrdersDictionaries;
}

const Toolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
  dictionaries,
}: ToolbarProps) => {
  const { smAndDown } = useBreakpointsContext();
  const { t } = useTranslation();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t("common.stock_management"), path: "/" },
    { title: t("common.orders") },
  ];

  const statusOptions = useMemo(
    () =>
      Object.entries(dictionaries.order_statuses).map(([value, label]) => ({
        value,
        label: t(`common.order_status_${label}`),
      })),
    [dictionaries.order_statuses, t],
  );

  const orderTypeOptions = useMemo(
    () =>
      Object.entries(dictionaries.order_types).map(([value, label]) => ({
        value,
        label: t(`common.order_type_${label}`),
      })),
    [dictionaries.order_types, t],
  );

  const supplierOptions = useMemo(
    () =>
      dictionaries.suppliers.map((supplier) => ({
        value: supplier.id.toString(),
        label: supplier.name,
      })),
    [dictionaries.suppliers],
  );

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) pt-4",
        )}
      >
        <div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
        </div>
        <div className="flex gap-2"></div>
      </div>

      <div
        className={clsx(
          "flex flex-wrap items-center justify-between gap-4 pt-4 pb-1",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={globalFilter}
            onChange={(e) => {
              const value = e.target.value;
              setGlobalFilter(value);
              table.setGlobalFilter(value);
            }}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            placeholder={t("common.search_orders")}
            classNames={{
              root: "shrink-0",
              input: "ring-primary-500/50 h-8 text-xs focus:ring-3",
            }}
          />

          <Select
            placeholder={t("common.order_status_filter")}
            className="h-8 min-w-[160px]"
            size="sm"
            data={[
              { label: t("common.all_statuses"), value: "" },
              ...statusOptions,
            ]}
            onChange={(event) => {
              const value = event.target.value;
              const column = table.getColumn("status");
              column?.setFilterValue(value);
            }}
          />

          <Select
            placeholder={t("common.order_type_filter")}
            className="h-8 min-w-[160px]"
            size="sm"
            data={[
              { label: t("common.all_order_types"), value: "" },
              ...orderTypeOptions,
            ]}
            onChange={(event) => {
              const value = event.target.value;
              const column = table.getColumn("order_type");
              column?.setFilterValue(value);
            }}
          />

          <Select
            placeholder={t("common.order_supplier_filter")}
            className="h-8 min-w-[180px]"
            size="sm"
            data={[
              { label: t("common.all_suppliers"), value: "" },
              ...supplierOptions,
            ]}
            onChange={(event) => {
              const value = event.target.value;
              const column = table.getColumn("supplier");
              column?.setFilterValue(value);
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="filled"
            color="primary"
            className="h-8 gap-2 rounded-md px-3 text-xs"
            onClick={() => {
              router.visit(route("orders.create"));
            }}
          >
            <PlusIcon className="size-4" />
            <span>{t("common.create_order")}</span>
          </Button>

          <ResponsiveFilter
            anchor={{ to: "bottom end", gap: 12 }}
            buttonContent={
              <>
                <ViewColumnsIcon className="size-4" />
                <span>{t("common.view")}</span>
              </>
            }
            classNames={{
              button: "border-solid! h-8 gap-2 rounded-md px-3 text-xs",
            }}
          >
            {smAndDown ? (
              <div className="dark:border-dark-500 mx-auto flex h-12 w-full shrink-0 items-center justify-between border-b border-gray-200 px-3">
                <p className="dark:text-dark-50 truncate text-start text-base font-medium text-gray-800">
                  {t("common.table_view")}
                </p>
              </div>
            ) : (
              <h3 className="text-sm-plus dark:text-dark-100 px-3 pt-2.5 font-medium tracking-wide text-gray-800">
                {t("common.table_view")}
              </h3>
            )}

            <div className="flex flex-col max-sm:overflow-hidden sm:w-64">
              <TableSettings table={table} />
            </div>
          </ResponsiveFilter>
        </div>
      </div>
    </div>
  );
};

export { Toolbar };

