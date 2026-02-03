import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { router } from "@inertiajs/react";
import { Page } from "@/components/shared/Page";
import { Button, Card } from "@/components/ui";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { Blog } from "./types";

interface ShowProps {
  blog: Blog;
}

const Show = ({ blog }: ShowProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleEdit = () => {
    router.visit(route('blogs.edit', blog.uuid) as string);
  };

  const handleDelete = () => {
    if (window.confirm(t('common.confirm_delete_blog'))) {
      router.delete(route('blogs.destroy', blog.uuid) as string, {
        onSuccess: () => {
          showToast({
            type: 'success',
            message: t('common.blog_deleted_success'),
            duration: 3000,
          });
          router.visit(route('blogs.index'));
        },
        onError: () => {
          showToast({
            type: 'error',
            message: t('common.blog_delete_error'),
            duration: 3000,
          });
        }
      });
    }
  };

  return (
    <MainLayout>
      <Page 
        title={blog.title || t("common.metadata_titles.blogs_show")}
        description={t("common.page_descriptions.blogs_show") || "View blog post details including content, author, and publication date."}
      >
        <div className="transition-content px-(--margin-x) pb-6">
          <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outlined"
                onClick={() => router.visit(route('blogs.index'))}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="size-4" />
                {t('common.back')}
              </Button>
              <h2 className="dark:text-dark-50 line-clamp-1 text-xl font-medium text-gray-700">
                {blog.title}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                className="min-w-[7rem]"
                variant="outlined"
                onClick={handleEdit}
              >
                <PencilIcon className="size-4 mr-2" />
                {t('common.edit')}
              </Button>
              <Button
                className="min-w-[7rem]"
                color="error"
                onClick={handleDelete}
              >
                <TrashIcon className="size-4 mr-2" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card className="p-4 sm:px-5">
                <div className="space-y-6">
                  {blog.image && (
                    <img
                      className="w-full h-96 object-cover rounded-lg"
                      src={blog.image?.url || blog.image?.path || ""}
                      alt={blog.caption}
                    />
                  )}
                  
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {blog.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                      {blog.caption}
                    </p>
                    <div className="prose max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: blog.body }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
              <Card className="p-4 sm:px-5">
                <h6 className="dark:text-dark-100 text-base font-medium text-gray-800 mb-4">
                  {t('common.blog_info')}
                </h6>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('common.category')}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {blog.category_blog?.name || t('common.no_category')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('common.created_at')}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {blog.tags && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('common.tags')}:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {blog.tags}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 sm:px-5">
                <h6 className="dark:text-dark-100 text-base font-medium text-gray-800 mb-4">
                  {t('common.seo_meta_data')}
                </h6>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('common.meta_title')}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {blog.meta_title}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('common.meta_description')}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {blog.meta_desc}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('common.meta_keywords')}:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {blog.meta_keywords}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
};

export default Show;
