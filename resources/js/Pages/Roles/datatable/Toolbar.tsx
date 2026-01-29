import clsx from "clsx";
import { MagnifyingGlassIcon, PlusIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
import { TableSettings } from "@/components/shared/table/TableSettings";
import { ResponsiveFilter } from "@/Components/shared/table/ResponsiveFilter";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useTranslation } from "@/hooks/useTranslation";
import { BreadcrumbItem, Breadcrumbs } from "@/Components/shared/Breadcrumbs";
import { router } from "@inertiajs/react";

import type { Role } from "./types";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface ToolbarProps {
  table: any;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  sorting: any;
  setSelectedRole: (role: Role | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

const Toolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
  sorting,
  setSelectedRole,
  setIsModalOpen,
}: ToolbarProps) => {
  const { smAndDown } = useBreakpointsContext();
  const { t } = useTranslation();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t("common.roles"), path: "/" },
    { title: t("common.roles_management") },
  ];

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "pt-4",
        )}
      >
        <div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
        </div>
      </div>

      <div
        className={clsx(
          "flex justify-between gap-4 pt-4 pb-1",
          isFullScreenEnabled ? "px-4 sm:px-5" : "",
        )}
      >
        <div className="flex shrink-0 gap-2">
          <Input
            value={globalFilter}
            onChange={(e) => {
              const value = e.target.value;
              setGlobalFilter(value);

              const sortBy = sorting.length > 0 ? sorting[0].id : "created_at";
              const sortDirection = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc";

              router.visit(
                route("roles.index", {
                  page: 1,
                  per_page: 12,
                  search: value?.trim() ? value : undefined,
                  sort_by: sortBy,
                  sort_direction: sortDirection,
                }),
                {
                  preserveScroll: false,
                  preserveState: false,
                  replace: true,
                },
              );
            }}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            placeholder={t("common.search_roles") || "Search roles..."}
            classNames={{
              root: "shrink-0",
              input: "ring-primary-500/50 h-8 text-xs focus:ring-3",
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="filled"
            color="primary"
            className="h-8 gap-2 rounded-md px-3 text-xs"
            onClick={() => {
              setSelectedRole(null);
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="size-4" />
            {!smAndDown && <span>{t("common.create") || "Create"}</span>}
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

