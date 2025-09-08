import clsx from "clsx";
import {
  ArrowUpTrayIcon,
  QuestionMarkCircleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { SearchInput, ExportButton, CreateButton, TableSettingsButton } from "@/components/shared/table";
import { useBreakpointsContext } from "@/contexts/breakpoint/context";
import { CategoryBlog } from "@/Pages/CategoryBlogs/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { router, usePage } from "@inertiajs/react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { ParentCategoryFilter } from "./ParentCategoryFilter";

interface ToolbarProps {
  table: any;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onSearch?: (value: string) => void;
  setSelectedCategoryBlog: (categoryBlog: CategoryBlog | null) => void;
  setIsModalOpen: (open: boolean) => void;
  parentCategories?: {
    data: CategoryBlog;
  };
}

const Toolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
  onSearch,
  setSelectedCategoryBlog,
  setIsModalOpen,
  parentCategories
}: ToolbarProps) => {
  const { smAndDown, isXs } = useBreakpointsContext();
  const { t } = useTranslation();
  const { props } = usePage();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;
  const { showToast } = useToast();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.blog_management'), path: "/" },
    { title: t('common.category_blog_management')},
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
          <SearchInput
            value={globalFilter}
            onChange={setGlobalFilter}
            onSearch={onSearch}
            table={table}
            placeholder={t('common.search_category_blogs')}
          />
          {table.getColumn("parentCategory") && (
            <ParentCategoryFilter
              column={table.getColumn("parentCategory")!}
              options={parentCategories.data}
            />
          )}
        </div>

        <div className="flex gap-2">
          <ExportButton
            onExport={() => {
              const link = document.createElement('a');
              link.href = route('category-blogs.export');
              link.download = 'category-blogs.csv';
              link.click();
            }}
            label={t('common.export_csv')}
          />

          <div className="relative inline-block group">
            <Button
              type="button"
              variant="outlined"
              color="primary"
              className="h-8 gap-2 rounded-md px-3 text-xs pointer-events-none"
            >
              <ArrowUpTrayIcon className="size-4" />
              <span>{t('common.import_csv')}</span>
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
                    const csvContent = 'Name,Description,Parent Category\nVaccines,Veterinary vaccines,Medications\nDiagnostic Tools,Medical diagnostic equipment,Equipment';
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'category_blogs_template.csv';
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
                // Reset value to ensure onChange fires even if same file is selected
                e.currentTarget.value = '';
              }}
              onChange={async (e) => {
                console.log('File input change event triggered');
                if (e.target.files?.length) {
                  const file = e.target.files[0];
                  console.log('File selected:', file.name);
                  
                  try {
                    // Validate file size
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                      showToast({
                        type: 'error',
                        message: t('common.import_validation.file_size_limit', { size: '5MB' }),
                        duration: 5000,
                      });
                      return;
                    }

                    // Validate file type
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
                    
                    // Show the importing toast
                    showToast({
                      type: 'info',
                      message: t('common.importing'),
                      duration: 0, // 0 means it won't auto-dismiss
                    });

                    console.log('Sending request to:', route('category-blogs.import'));

                    // Make sure the file input is cleared right after we get the file
                    e.target.value = '';

                    // Create form data for the request
                    await router.post(route('category-blogs.import'), formData);

                    // Customize the visit options
                    router.visit(route('category-blogs.import'), {
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
                          // Handle other validation errors
                          const errorKey = errors.error.split('.')[1];
                          switch (errorKey) {
                            case 'required':
                              errorMessage = t('common.import_validation.missing_required_fields');
                              break;
                            case 'parent_exists':
                              errorMessage = t('common.import_validation.parent_category_not_found');
                              break;
                            case 'unique':
                              errorMessage = t('common.import_validation.duplicate_category_name');
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
                        router.visit(route('category-blogs.index'), {
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

          <CreateButton
            onClick={() => {
              setSelectedCategoryBlog(null);
              setIsModalOpen(true);
            }}
            label={t('common.create_category_blog')}
          />

          <TableSettingsButton table={table} />
        </div>
      </div>
    </div>
  );
}

export { Toolbar };
