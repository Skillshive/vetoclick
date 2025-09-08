// Import Dependencies
import { TbPinned, TbPinnedOff } from "react-icons/tb";
import { Table } from "@tanstack/react-table";
import invariant from "tiny-invariant";

// Local Imports
import { Button, Checkbox, Switch } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface TableMetaType {
  tableSettings?: {
    enableFullScreen?: boolean;
    enableRowDense?: boolean;
    enableColumnFilters?: boolean;
    enableSorting?: boolean;
  };
  setTableSettings?: (updater: any) => void;
}

// ----------------------------------------------------------------------

export interface TableSettings {
  enableFullScreen?: boolean;
  enableRowDense?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
}

export function TableSettings({ table }: { table: Table<any> }) {
  const tableSettings = (table.options.meta as TableMetaType)?.tableSettings;
  const setTableSettings = table.options.meta?.setTableSettings;
  const { t } = useTranslation();

  invariant(tableSettings, "tableSettings is required");
  invariant(setTableSettings, "setTableSettings is required");

  return (
    <>
      {Object.keys(tableSettings).length > 0 && (
        <div className="dark:text-dark-100 mt-3 mb-4 flex flex-col items-start space-y-2 px-3 text-gray-600">
          {Object.prototype.hasOwnProperty.call(
            tableSettings,
            "enableFullScreen",
          ) && (
            <Switch
              label={t('common.full_screen')}
              checked={tableSettings.enableFullScreen}
              onChange={(e) =>
                setTableSettings((state) => ({
                  ...state,
                  enableFullScreen: e.target.checked,
                }))
              }
              className="h-4 w-8"
            />
          )}
          {/* {Object.prototype.hasOwnProperty.call(
            tableSettings,
            "enableRowDense",
          ) && (
            <Switch
              label={t('common.row_dense')}
              checked={tableSettings.enableRowDense}
              onChange={(e) =>
                setTableSettings((state) => ({
                  ...state,
                  enableRowDense: e.target.checked,
                }))
              }
              className="h-4 w-8"
            />
          )} */}
          {Object.prototype.hasOwnProperty.call(
            tableSettings,
            "enableColumnFilters",
          ) && (
            <Switch
              label={t('common.column_filters')}
              checked={tableSettings.enableColumnFilters}
              onChange={(e) => {
                setTableSettings((state) => ({
                  ...state,
                  enableColumnFilters: e.target.checked,
                }));

                table.resetColumnFilters();
              }}
              className="h-4 w-8"
            />
          )}
          {Object.prototype.hasOwnProperty.call(
            tableSettings,
            "enableSorting",
          ) && (
            <Switch
              label={t('common.sort')}
              checked={tableSettings.enableSorting}
              onChange={(e) => {
                setTableSettings((state) => ({
                  ...state,
                  enableSorting: e.target.checked,
                }));
                table.resetSorting();
              }}
              className="h-4 w-8"
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 rtl:space-x-reverse px-3">
        <p className="text-tiny uppercase">{t('common.column_visibility')}</p>
        <hr className="dark:border-dark-500 flex-1 border-gray-300" />
      </div>

      <div className="dark:text-dark-100 mt-3 flex max-h-[50vh] flex-col space-y-2 overflow-y-auto overscroll-y-contain px-3 pb-3 text-gray-600">
        {table
          .getAllLeafColumns()
          .filter((column) => !column.columnDef?.isHiddenColumn)
          .map((column) => {
            // Get the translated column label
            let columnLabel = column.id;
            if (typeof column?.columnDef?.header === 'string') {
              columnLabel = column.columnDef.header;
            } else if (column?.columnDef?.label) {
              columnLabel = column.columnDef.label;
            }
            
            return (
              <div
                className="flex items-center justify-between ltr:-mr-2 rtl:-ml-2"
                key={column.id}
              >
                <Checkbox
                  label={columnLabel}
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="size-4.5"
                />
                {column.getCanPin() &&
                  (column.getIsPinned() ? (
                    <Button
                      onClick={() => column.pin(false)}
                      variant="flat"
                      className="size-6 rounded-full"
                      isIcon
                      title={t('common.unpin_column')}
                      aria-label={t('common.unpin_column')}
                    >
                      <TbPinnedOff className="size-4" />
                    </Button>
                  ) : (
                    <div className="flex">
                      <Button
                        onClick={() => {
                          column.pin("left");
                        }}
                        variant="flat"
                        className="size-6 rounded-full rtl:rotate-180"
                        isIcon
                        title={t('common.pin_left')}
                        aria-label={t('common.pin_left')}
                      >
                        <TbPinned className="size-4 rotate-90" />
                      </Button>

                      <Button
                        onClick={() => {
                          column.pin("right");
                        }}
                        variant="flat"
                        className="size-6 -rotate-90 rounded-full"
                        isIcon
                        title={t('common.pin_right')}
                        aria-label={t('common.pin_right')}
                      >
                        <TbPinned className="size-4 rtl:rotate-180" />
                      </Button>
                    </div>
                  ))}
              </div>
            );
          })}
      </div>

      <Button
        variant="flat"
        className="text-xs-plus dark:border-dark-500 h-9 w-full shrink-0 rounded-t-none border-t border-gray-300 leading-none"
        onClick={() => table.resetColumnVisibility()}
      >
        {t('common.show_all_columns')}
      </Button>
    </>
  );
}