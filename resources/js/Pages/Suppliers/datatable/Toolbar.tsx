import clsx from "clsx";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ViewColumnsIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  QuestionMarkCircleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
import { TableSettings } from "@/components/shared/table/TableSettings";
import { ResponsiveFilter } from "@/components/shared/table/ResponsiveFilter";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { useTranslation } from "@/hooks/useTranslation";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { router } from "@inertiajs/react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Supplier } from "./types";

interface ToolbarProps {
  table: any;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

const Toolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
  setSelectedSupplier,
  setIsModalOpen,
}: ToolbarProps) => {
  const { smAndDown } = useBreakpointsContext();
  const { t } = useTranslation();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;
  const { showToast } = useToast();

  const urlParams = new URLSearchParams(window.location.search);
  const hasUrlFilters = urlParams.has('search') ||
    urlParams.has('per_page') && urlParams.get('per_page') !== '10' ||
    urlParams.has('sort_by') && urlParams.get('sort_by') !== 'created_at' ||
    urlParams.has('sort_direction') && urlParams.get('sort_direction') !== 'desc';

  const hasActiveFilters = table.getState().columnFilters.length > 0 ||
    (globalFilter && globalFilter.trim() !== '') ||
    hasUrlFilters;

  // Clear all filters function
  const handleClearAllFilters = () => {
    // Clear table column filters
    table.resetColumnFilters();

    // Clear global search filter
    setGlobalFilter('');

    // Navigate to clear URL parameters
    router.visit(route('suppliers.index'), {
      preserveScroll: false,
      preserveState: false,
      replace: true
    });
  };
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.stock_management'), path: "/" },
    { title: t('common.suppliers_management')},
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
        <div className="flex gap-2">
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
              table.setGlobalFilter(value);
            }}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            placeholder={t('common.search_suppliers')}
            classNames={{
              root: "shrink-0",
              input: "ring-primary-500/50 h-8 text-xs focus:ring-3",
            }}
          />
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outlined"
              color="error"
              onClick={handleClearAllFilters}
              className="h-8 gap-2 rounded-md px-3 text-xs"
            >
              <XMarkIcon className="size-4" />
            </Button>
          )}

          <Button
            variant="outlined"
            color="primary"
            className="h-8 gap-2 rounded-md px-3 text-xs"
            onClick={() => {
              const link = document.createElement('a');
              link.href = route('suppliers.export');
              link.download = 'suppliers.csv';
              link.click();
            }}
          >
            <ArrowDownTrayIcon className="size-4" />
            <span>{t('common.export_csv')}</span>
          </Button>

          <div className="relative inline-block group">
            <Button
              type="button"
              variant="outlined"
              color="primary"
              className="h-8 gap-2 rounded-md px-3 text-xs pointer-events-none"
            >
              <ArrowUpTrayIcon className="size-4" />
              <QuestionMarkCircleIcon className="size-4 ml-1 text-gray-400" />
            </Button>
            


            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
              <div>
                <Button
                  variant="outlined"
                  color="primary"
                  className="text-white hover:text-primary-200"
                  onClick={() => {
                    const csvContent = 'Name,Description,Parent Category';
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'supplier_template.csv';
                    link.click();
                    URL.revokeObjectURL(link.href);
                  }}
                >
                  <DocumentArrowDownIcon className="size-4" />
                  {t('common.download_template')}
                </Button>
              </div>
            </div>
            <input
              type="file"
              id="import-csv"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onClick={(e) => {
                e.currentTarget.value = '';
              }}
              onChange={async (e) => {
                console.log('File input change event triggered');
                if (e.target.files?.length) {
                  const file = e.target.files[0];
                  console.log('File selected:', file.name);
                  
                  try {
                    if (file.size > 5 * 1024 * 1024) { 
                      showToast({
                        type: 'error',
                        message: t('common.import_validation.file_size_limit', { size: '5MB' }),
                        duration: 5000,
                      });
                      return;
                    }

                    if (!file.name.endsWith('.csv')) {
                      showToast({
                        type: 'error',
                        message: t('common.import_validation.invalid_file_type'),
                        duration: 5000,
                      });
                      return;
                    }

                    const formData = new FormData();
                    formData.append('file', file);
                    console.log('FormData created with file');

                    showToast({
                      type: 'info',
                      message: t('common.importing'),
                      duration: 0, 
                    });

                    console.log('Sending request to:', route('suppliers.import'));

                    e.target.value = '';

                    router.visit(route('suppliers.import'), {
                      method: 'post',
                      data: formData,
                      preserveState: true,
                      preserveScroll: true,
                      onError: (errors: Record<string, string>) => {
                        console.error('Import error:', errors);

                        let errorMessage = t('common.import_error');
                        if (errors.error === 'validation.csv_headers_invalid') {
                          errorMessage = t('common.import_validation.invalid_csv_format');
                        } else if (errors.error?.includes('validation.')) {
                          const errorKey = errors.error.split('.')[1];
                          switch (errorKey) {
                            case 'required':
                              errorMessage = t('common.import_validation.missing_required_fields');
                              break;
                            case 'parent_exists':
                              errorMessage = t('common.import_validation.parent_supplier_not_found');
                              break;
                            case 'unique':
                              errorMessage = t('common.import_validation.duplicate_supplier_name');
                              break;
                            default:
                              errorMessage = `${t('common.import_error')}: ${errors.error}`;
                          }
                        } else if (errors.error) {
                          errorMessage += `: ${errors.error}`;
                        }

                        showToast({
                          type: 'error',
                          message: errorMessage,
                          duration: 8000,
                        });
                      },
                      onSuccess: () => {
                        console.log('Import successful');
                        showToast({
                          type: 'success',
                          message: t('common.import_success'),
                          duration: 3000,
                        });
                        router.visit(route('suppliers.index'), {
                          preserveScroll: true,
                          preserveState: false
                        });
                      },
                      onFinish: () => {
                        console.log('Request finished');
                      }
                    });
                  } catch (error) {
                    console.error('Upload error:', error);
                    showToast({
                      type: 'error',
                      message: t('common.import_error'),
                      duration: 3000,
                    });
                  }
                } else {
                  console.log('No file selected');
                }
              }}
            />
          </div>

          <Button
            variant="filled"
            color="primary"
            className="h-8 gap-2 rounded-md px-3 text-xs"
            onClick={() => {
              setSelectedSupplier(null);
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="size-4" />
            <span>{t('common.create_supplier')}</span>
          </Button>

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
        </div>
      </div>
    </div>
  );
}

export { Toolbar };
