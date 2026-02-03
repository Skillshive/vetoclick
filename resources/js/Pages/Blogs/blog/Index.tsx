import { Button, Card, Input, Pagination, PaginationItems, PaginationNext, PaginationPrevious } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi2";
import { router } from "@inertiajs/react";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { useState } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Blog, BlogsProps } from "./types";
import { BlogCard } from "./partials/BlogCard";
import LampIcon from "@/assets/dualicons/lamp.svg?react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Index({
   blogs,
   category_blogs = [],
   filters = {}
}: BlogsProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleDeleteBlog = async (blog: Blog) => {
    // @ts-ignore
    router.delete(route('blogs.destroy', blog.uuid), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showToast({
          type: 'success',
          message: t('common.blog_deleted_success'),
          duration: 3000,
        });
        
        // Refresh the page to get updated data
        setTimeout(() => {
          router.visit(route('blogs.index') as any, {
            data: {
              search: searchQuery,
              page: meta?.current_page || 1,
              per_page: meta?.per_page || 10
            },
            preserveScroll: true,
          });
        }, 100);
      },
      onError: () => {
        showToast({
          type: 'error',
          message: t('common.blog_delete_error'),
          duration: 3000,
        });
      }
    });
  };

  const blogsList = blogs?.data || [];
  const meta = blogs?.meta || null;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.blogs'), path: route('blogs.index') },
    { title: t('common.blogs_management')},
  ];

  return (
    <MainLayout>
            <Page 
              title={t('common.metadata_titles.blogs_index')}
              description={t("common.page_descriptions.blogs_index") || "Manage blog posts. Create, edit, and publish articles for your veterinary clinic."}
            >
          <div className="transition-content px-(--margin-x) pb-6 my-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.manage_blogs')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input
            classNames={{
              input: "text-xs-plus h-9 rounded-full",
              root: "max-sm:hidden",
            }}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }
              const timeout = setTimeout(() => {
                router.visit(route('blogs.index') as any, {
                  data: { search: e.target.value, page: 1 },
                  preserveState: true,
                  preserveScroll: true,
                });
              }, 500);
              setSearchTimeout(timeout);
            }}
            placeholder={t('common.search_blogs')}
            className=""
            prefix={<MagnifyingGlassIcon className="size-4.5" />}
          />
          
          <Button
            variant="filled"
            color="primary"
            className="h-8 gap-2 rounded-md px-3"
            onClick={() => router.visit(route('blogs.create'))}
          >
            <HiPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {blogsList.length === 0 ? (
        <Card className="p-6 text-center">
 <LampIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-dark-300">
                          {t('common.no_blogs_found')}
                        </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {blogsList.map((blog) => (
              <BlogCard
                key={blog.uuid}
                blog={blog}
                onDelete={handleDeleteBlog}
              />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                total={meta.last_page}
                value={meta.current_page}
                onChange={(page) => {
                  router.visit(route('blogs.index') as any, {
                    data: { 
                      page: page, 
                      per_page: meta.per_page,
                      search: searchQuery 
                    },
                    preserveState: true,
                    preserveScroll: true,
                  });
                }}
                className="flex items-center gap-1"
              >
                <PaginationPrevious />
                <PaginationItems />
                <PaginationNext />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
    </Page>
    </MainLayout>
  );
}