// Import Dependencies
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Fragment, useState, useRef, useEffect } from "react";
import { TrashIcon, InboxIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";

// Local Imports
import { Table, Card, THead, TBody, Th, Tr, Td, Button } from "@/components/ui";
import { TableSortIcon } from "@/components/shared/table/TableSortIcon";
import { Page } from "@/components/shared/Page";
import { useLockScrollbar, useDidUpdate } from "@/hooks";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { PaginationSection } from "@/components/shared/table/PaginationSection";
import { getUserAgentBrowser } from "@/utils/dom/getUserAgentBrowser";
import { useThemeContext } from "@/contexts/theme/context";
import CategoryProductFormModal from "@/components/modals/CategoryProductFormModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/common/Toast/ToastContext";
import {
  ConfirmModal,
} from "@/components/shared/ConfirmModal";

// Local Component Imports
import { CategoryProductDatatableProps } from "./types";
import { createColumns } from "./columns";
import { Toolbar } from "./Toolbar";
import { useCategoryProductTable } from "./hooks";

const isSafari = getUserAgentBrowser() === "Safari";

export default function CategoryProductDatatable({ categoryProducts: categoryProductsData, parentCategories, filters }: CategoryProductDatatableProps) {
  const { cardSkin } = useThemeContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    categoryProducts,
    isModalOpen,
    setIsModalOpen,
    selectedCategoryProduct,
    setSelectedCategoryProduct,
    bulkDeleteModalOpen,
    setBulkDeleteModalOpen,
    confirmBulkDeleteLoading,
    setConfirmBulkDeleteLoading,
    bulkDeleteSuccess,
    setBulkDeleteSuccess,
    bulkDeleteError,
    setBulkDeleteError,
    tableSettings,
    toolbarFilters,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    autoResetPageIndex,
    tableMeta,
  } = useCategoryProductTable({
    initialData: categoryProductsData.data,
    initialFilters: filters,
  });

  // Create columns with modal handlers
  const columns = createColumns({ setSelectedCategoryProduct, setIsModalOpen, t });

  const table = useReactTable({
    data: categoryProducts.data,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
      toolbarFilters,
    },
    meta: tableMeta,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [categoryProducts]);
  useLockScrollbar(tableSettings.enableFullScreen);

  useEffect(() => {
    if (cardRef.current) {
      const children = cardRef.current.childNodes;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim() === '0') {
          cardRef.current.removeChild(child);
          i--; // adjust index
        }
      }
    }
  }, [table.getCoreRowModel().rows.length]);

  // Bulk delete handlers
  const closeBulkModal = () => {
    setBulkDeleteModalOpen(false);
  };

  const openBulkModal = () => {
    setBulkDeleteModalOpen(true);
    setBulkDeleteError(false);
    setBulkDeleteSuccess(false);
  };

  const [bulkDeleteCount, setBulkDeleteCount] = useState(0);

  const handleBulkDeleteRows = () => {
    setConfirmBulkDeleteLoading(true);
    const selectedRows = table.getSelectedRowModel().rows;
    const deleteCount = selectedRows.length;
    setBulkDeleteCount(deleteCount);

    setTimeout(() => {
      table.options.meta?.deleteRows?.(selectedRows);
      setConfirmBulkDeleteLoading(false);
      closeBulkModal();
      // Show success toast
      showToast({
        type: 'success',
        message: t('common.category_products_deleted_success', { count: deleteCount }),
      });
    }, 1000);
  };

  return (
    <>
    <Page title={t('common.category_products')}>
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen &&
              "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3",
          )}
        >
          <Toolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            setSelectedCategoryProduct={setSelectedCategoryProduct}
            setIsModalOpen={setIsModalOpen}
            parentCategories={parentCategories}
          />
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3",
              tableSettings.enableFullScreen
                ? "overflow-hidden"
                : "px-(--margin-x)",
            )}
          >
            <Card
              ref={cardRef}
              className={clsx(
                "relative flex grow flex-col",
                tableSettings.enableFullScreen && "overflow-hidden",
              )}
            >
              <div className="table-wrapper min-w-full grow overflow-x-auto">
                <Table
                  hoverable
                  dense={tableSettings.enableRowDense}
                  sticky={tableSettings.enableFullScreen}
                  className="w-full text-left rtl:text-right"
                >
                  <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id}>
                        {headerGroup.headers
                          .filter(
                            (header) => !header.column.columnDef.isHiddenColumn,
                          )
                          .map((header) => (
                            <Th
                              key={header.id}
                              className={clsx(
                                "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 uppercase first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
                                header.column.getCanPin() && [
                                  header.column.getIsPinned() === "left" &&
                                    "sticky z-2 ltr:left-0 rtl:right-0",
                                  header.column.getIsPinned() === "right" &&
                                    "sticky z-2 ltr:right-0 rtl:left-0",
                                ],
                              )}
                            >
                              {header.column.getCanSort() ? (
                                <div
                                  className="flex cursor-pointer items-center space-x-3 select-none"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <span className="flex-1">
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                  </span>
                                  <TableSortIcon
                                    sorted={header.column.getIsSorted()}
                                  />
                                </div>
                              ) : header.isPlaceholder ? null : (
                                flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )
                              )}
                            </Th>
                          ))}
                      </Tr>
                    ))}
                  </THead>
                  <TBody>
                    {table.getCoreRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => {
                        return (
                          <Tr
                            key={row.id}
                            className={clsx(
                              "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                              row.getIsSelected() &&
                                !isSafari &&
                                "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                            )}
                          >
                            {row
                              .getVisibleCells()
                              .filter(
                                (cell) => !cell.column.columnDef.isHiddenColumn,
                              )
                              .map((cell) => {
                                return (
                                  <Td
                                    key={cell.id}
                                    className={clsx(
                                      "relative",
                                      cardSkin === "shadow"
                                        ? "dark:bg-dark-700"
                                        : "dark:bg-dark-900",

                                      cell.column.getCanPin() && [
                                        cell.column.getIsPinned() === "left" &&
                                          "sticky z-2 ltr:left-0 rtl:right-0",
                                        cell.column.getIsPinned() === "right" &&
                                          "sticky z-2 ltr:right-0 rtl:left-0",
                                      ],
                                    )}
                                  >
                                    {cell.column.getIsPinned() && (
                                      <div
                                        className={clsx(
                                          "dark:border-dark-500 pointer-events-none absolute inset-0 border-gray-200",
                                          cell.column.getIsPinned() === "left"
                                            ? "ltr:border-r rtl:border-l"
                                            : "ltr:border-l rtl:border-r",
                                        )}
                                      ></div>
                                    )}
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </Td>
                                );
                              })}
                          </Tr>
                        );
                      })
                    ) : (
                      <Tr>
                        <Td
                          colSpan={table.getVisibleLeafColumns().length}
                          className="text-center py-8"
                        >
                          <InboxIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-400" />
                          <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                            {t('common.no_data')}
                          </p>
                        </Td>
                      </Tr>
                    )}
                  </TBody>
                </Table>
              </div>
              {/* Floating Selected Rows Actions */}
              <Transition
                as={Fragment}
                show={(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && table.getCoreRowModel().rows.length > 0}
                enter="transition-all duration-200"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="transition-all duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <div className="pointer-events-none sticky inset-x-0 bottom-0 z-5 flex items-center justify-end">
                  <div className="w-full max-w-xl px-2 py-4 sm:absolute sm:-translate-y-1/2 sm:px-4">
                    <div className="dark:bg-dark-50 dark:text-dark-900 pointer-events-auto flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 font-medium text-gray-100 sm:px-4 sm:py-3">
                      <p>
                        <span>{table.getSelectedRowModel().rows.length} {t('common.selected')}</span>
                        <span className="max-sm:hidden">
                          {" "}
                          {t('common.from')} {table.getCoreRowModel().rows.length}
                        </span>
                      </p>
                      <div className="flex space-x-1.5">
                        <Button
                          onClick={openBulkModal}
                          className="text-xs-plus w-7 gap-1.5 rounded-full px-3 py-1.5 sm:w-auto sm:rounded-sm"
                          color="error"
                          disabled={table.getSelectedRowModel().rows.length <= 0}
                        >
                          <TrashIcon className="size-4 shrink-0" />
                          <span className="max-sm:hidden">{t('common.delete')}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
              {table.getCoreRowModel().rows.length && (
                <div
                  className={clsx(
                    "px-4 pb-4 sm:px-5 sm:pt-4",
                    tableSettings.enableFullScreen &&
                      "dark:bg-dark-800 bg-gray-50",
                    !(
                      table.getIsSomeRowsSelected() ||
                      table.getIsAllRowsSelected()
                    ) && "pt-4",
                  )}
                >
                  <PaginationSection table={table} />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Page>
    
    <CategoryProductFormModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setSelectedCategoryProduct(null);
      }}
      categoryProduct={selectedCategoryProduct}
      parentCategories={parentCategories.data}
    />

    <ConfirmModal
      show={bulkDeleteModalOpen}
      onClose={closeBulkModal}
      messages={{
        pending: {
          description: t('common.confirm_delete_category_products', { count: table.getSelectedRowModel().rows.length }),
        },
      }}
      onOk={handleBulkDeleteRows}
      confirmLoading={confirmBulkDeleteLoading}
      state="pending"
    />
    </>
  );
}
