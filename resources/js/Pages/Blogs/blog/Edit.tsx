import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { CoverImageUpload } from "@/components/shared/form/CoverImageUpload";
import { Tags } from "@/components/shared/form/Tags";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { blogFormSchema } from "@/schemas/blogSchema";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { getImageUrl } from "@/utils/imageHelper";
import { BlogFormData, CategoryBlog, Blog } from "./types";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";

interface TagItem {
  id: string;
  value: string;
}

interface EditProps {
  blog: Blog;
  category_blogs?: CategoryBlog[];
}

const Edit = ({ blog, category_blogs = [] }: EditProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    body?: string;
    caption?: string;
    meta_title?: string;
    meta_desc?: string;
    meta_keywords?: string;
    category_blog_id?: string;
    tags?: string;
    image_file?: string;
  }>({});

  const [data, setData] = useState<BlogFormData>({
    title: blog.title || '',
    body: blog.body || '',
    caption: blog.caption || '',
    meta_title: blog.meta_title || '',
    meta_desc: blog.meta_desc || '',
    meta_keywords: blog.meta_keywords || '',
    category_blog_id: blog.category_blog?.uuid || '',
    tags: blog.tags || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [tags, setTags] = useState<TagItem[]>(() => {
    if (blog.tags) {
      return blog.tags.split(',').map(tag => ({
        id: Math.random().toString(36).substr(2, 9),
        value: tag.trim()
      })).filter(tag => tag.value);
    }
    return [];
  });
  const [metaKeywords, setMetaKeywords] = useState<TagItem[]>(() => {
    if (blog.meta_keywords) {
      return blog.meta_keywords.split(',').map(keyword => ({
        id: Math.random().toString(36).substr(2, 9),
        value: keyword.trim()
      })).filter(keyword => keyword.value);
    }
    return [];
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success) {
      showToast({
        type: 'success',
        message: success,
        duration: 3000,
      });
    }
    
    if (error) {
      showToast({
        type: 'error',
        message: error,
        duration: 3000,
      });
    }
  }, [showToast]);

 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = blogFormSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setValidationErrors({
            title: errors.title?.[0] ? t(errors.title[0]) : undefined,
            body: errors.body?.[0] ? t(errors.body[0]) : undefined,
            caption: errors.caption?.[0] ? t(errors.caption[0]) : undefined,
            image_file: (errors as any).image_file?.[0] ? t((errors as any).image_file[0]) : undefined,
            meta_title: errors.meta_title?.[0] ? t(errors.meta_title[0]) : undefined,
            meta_desc: errors.meta_desc?.[0] ? t(errors.meta_desc[0]) : undefined,
            meta_keywords: errors.meta_keywords?.[0] ? t(errors.meta_keywords[0]) : undefined,
            category_blog_id: errors.category_blog_id?.[0] ? t(errors.category_blog_id[0]) : undefined,
            tags: errors.tags?.[0] ? t(errors.tags[0]) : undefined,
        });
        return;
    }

    setProcessing(true);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('body', data.body);
    formData.append('caption', data.caption);
    formData.append('meta_title', data.meta_title);
    formData.append('meta_desc', data.meta_desc);
    formData.append('meta_keywords', metaKeywords.map(keyword => keyword.value).join(','));
    formData.append('category_blog_id', data.category_blog_id);
    formData.append('tags', tags.map(tag => tag.value).join(','));
    
    if (imageFile) {
        formData.append('image_file', imageFile);
    }

    router.post(route('blogs.update', blog.uuid), formData as any, {
        forceFormData: true,
        onBefore: () => {
            // Add _method for Laravel to recognize this as a PUT request
            formData.append('_method', 'PUT');
        },
        onSuccess: () => {
            setProcessing(false);
            showToast({
                type: 'success',
                message: t('common.blog_updated_success'),
                duration: 3000,
            });
            router.visit(route('blogs.index'));
        },
        onError: (errors: any) => {
            setProcessing(false);

            setValidationErrors({
                title: errors.title?.[0] || errors.title,
                body: errors.body?.[0] || errors.body,
                caption: errors.caption?.[0] || errors.caption,
                image_file: errors.image_file || errors.image_file,
                meta_title: errors.meta_title?.[0] || errors.meta_title,
                meta_desc: errors.meta_desc?.[0] || errors.meta_desc,
                meta_keywords: errors.meta_keywords?.[0] || errors.meta_keywords,
                category_blog_id: errors.category_blog_id?.[0] || errors.category_blog_id,
                tags: errors.tags?.[0] || errors.tags,
            });
            
            // Show toast with the first error message
            const firstError = Object.values(errors)[0];
            showToast({
                type: 'error',
                message: Array.isArray(firstError) ? firstError[0] : firstError || t('common.blog_update_error'),
                duration: 3000,
            });
        }
    });
};

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.blogs'), path: route('blogs.index') },
    { title: t('common.edit_blog')},
  ];
  
  return (
    <MainLayout>
      <Page title={t("common.edit_blog")}>
        <div className="transition-content px-(--margin-x) pb-6">
          <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
            <div className="flex items-center gap-1">
              <div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.edit_blog_description')}
          </p>
        </div>
            </div>
            <div className="flex gap-2">
              <Button 
                className="min-w-[7rem]" 
                variant="outlined"
                onClick={() => router.visit(route('blogs.index'))}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="min-w-[7rem]"
                color="primary"
                type="submit"
                form="edit-blog-form"
                disabled={processing}
              >
                {processing ? t('common.updating') : t('common.update')}
              </Button>
            </div>
          </div>
          
          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            id="edit-blog-form"
          >
            <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
              <div className="col-span-12 lg:col-span-8">
                <Card className="p-4 sm:px-5">
                  <h3 className="dark:text-dark-100 text-base font-medium text-gray-800">
                    {t('common.general_information')}
                  </h3>
                  <div className="mt-5 space-y-5">
                    <Input
                      label={t('common.title')}
                      placeholder={t('common.enter_blog_title')}
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      error={validationErrors.title}
                      required
                    />

                    <Input
                      label={t('common.caption')}
                      placeholder={t('common.enter_blog_caption')}
                      value={data.caption}
                      onChange={(e) => setData({ ...data, caption: e.target.value })}
                      error={validationErrors.caption}
                      required
                    />

                    <Textarea
                      label={t('common.body')}
                      placeholder={t('common.enter_blog_body')}
                      value={data.body}
                      onChange={(e) => setData({ ...data, body: e.target.value })}
                      error={validationErrors.body}
                      rows={6}
                      required
                    />

                    <CoverImageUpload
                      label={t('common.cover_image')}
                      value={imageFile}
                      existingImage={removeExistingImage ? null : (imageFile ? null : (blog.image?.path ? getImageUrl(blog.image.path, "/assets/default/image-placeholder.jpg") : null))}
                      onChange={(file) => {
                        setImageFile(file);
                        if (!file && blog.image?.path && !removeExistingImage) {
                          setRemoveExistingImage(true);
                        }
                        if (file) {
                          setRemoveExistingImage(false);
                        }
                      }}
                      error={validationErrors.image_file}
                      classNames={{
                        box: "mt-1.5",
                      }}
                    />
                  </div>
                </Card>
              </div>
              
              <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
                <Card className="space-y-5 p-4 sm:px-5">
                  <h6 className="dark:text-dark-100 text-base font-medium text-gray-800">
                    {t('common.category')}
                  </h6>
                  
                  <select
                    value={data.category_blog_id}
                    onChange={(e) => setData({ ...data, category_blog_id: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-this focus:outline-none focus:ring-1 focus:ring-this"
                    required
                  >
                    <option value="">{t('common.choose_category')}</option>
                    {category_blogs.map((category) => (
                      <option key={category.uuid} value={category.uuid}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category_blog_id && (
                    <p className="text-red-500 text-sm">{validationErrors.category_blog_id}</p>
                  )}

                  <Tags
                    label={t('common.tags')}
                    placeholder={t('common.enter_tags')}
                    value={tags}
                    onChange={setTags}
                    error={validationErrors.tags}
                  />
                </Card>

                <Card className="p-4 sm:px-5">
                  <h6 className="dark:text-dark-100 text-base font-medium text-gray-800">
                    {t('common.seo_meta_data')}
                  </h6>

                  <div className="mt-3 space-y-5">
                    <Input
                      label={t('common.meta_title')}
                      placeholder={t('common.enter_meta_title')}
                      value={data.meta_title}
                      onChange={(e) => setData({ ...data, meta_title: e.target.value })}
                      error={validationErrors.meta_title}
                      required
                    />
                    
                    <Textarea
                      label={t('common.meta_description')}
                      placeholder={t('common.enter_meta_description')}
                      value={data.meta_desc}
                      onChange={(e) => setData({ ...data, meta_desc: e.target.value })}
                      error={validationErrors.meta_desc}
                      rows={3}
                      required
                    />
                    
                    <Tags
                      label={t('common.meta_keywords')}
                      placeholder={t('common.enter_meta_keywords')}
                      value={metaKeywords}
                      onChange={setMetaKeywords}
                      error={validationErrors.meta_keywords}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </Page>
    </MainLayout>
  );
};

export default Edit;
