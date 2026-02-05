import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { router } from "@inertiajs/react";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { Switch } from "@/components/ui/Form/Switch";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { CoverImageUpload } from "@/components/shared/form/CoverImageUpload";
import { Tags } from "@/components/shared/form/Tags";
import { UncontrolledTextEditor } from "@/components/shared/form/UncontrolledTextEditor";
import Quill from "quill";

// Get Delta class and type from Quill
const Delta = Quill.import("delta");
type DeltaStatic = ReturnType<InstanceType<typeof Quill>['getContents']>;
import ReactSelect from "@/components/ui/ReactSelect";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { blogFormSchema } from "@/schemas/blogSchema";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { getImageUrl } from "@/utils/imageHelper";
import { BlogFormData, CategoryBlog, Blog } from "./types";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { htmlToDelta, deltaToHtml } from "@/utils/quillUtils";
import { 
  DocumentTextIcon, 
  ChatBubbleBottomCenterTextIcon, 
  FolderIcon,
  GlobeAltIcon,
  TagIcon,
  KeyIcon,
  CalendarIcon,
  StarIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

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
      // Handle different types: string, array, or null
      let tagsArray: string[] = [];
      const tagsValue = blog.tags as any;
      if (typeof tagsValue === 'string') {
        tagsArray = tagsValue.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      } else if (Array.isArray(tagsValue)) {
        tagsArray = tagsValue.map((tag: any) => typeof tag === 'string' ? tag.trim() : String(tag)).filter((tag: string) => tag);
      }
      
      return tagsArray.map(tag => ({
        id: Math.random().toString(36).substr(2, 9),
        value: tag
      }));
    }
    return [];
  });
  const [metaKeywords, setMetaKeywords] = useState<TagItem[]>(() => {
    if (blog.meta_keywords) {
      // Handle different types: string, array, or null
      let keywordsArray: string[] = [];
      const keywordsValue = blog.meta_keywords as any;
      if (typeof keywordsValue === 'string') {
        keywordsArray = keywordsValue.split(',').map((keyword: string) => keyword.trim()).filter((keyword: string) => keyword);
      } else if (Array.isArray(keywordsValue)) {
        keywordsArray = keywordsValue.map((keyword: any) => typeof keyword === 'string' ? keyword.trim() : String(keyword)).filter((keyword: string) => keyword);
      }
      
      return keywordsArray.map(keyword => ({
        id: Math.random().toString(36).substr(2, 9),
        value: keyword
      }));
    }
    return [];
  });

  const [processing, setProcessing] = useState(false);
  
  // Rich text editor state - convert existing HTML body to Delta for initial value
  const initialBodyDelta = useMemo<DeltaStatic>(() => {
    if (blog.body) {
      try {
        return htmlToDelta(blog.body);
      } catch {
        return new Delta();
      }
    }
    return new Delta();
  }, [blog.body]);
  
  // Additional blog fields - handle different data types from backend
  const [isPublished, setIsPublished] = useState(() => {
    const value = (blog as any).is_published;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === '1' || value === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  });
  const [isFeatured, setIsFeatured] = useState(() => {
    const value = (blog as any).is_featured;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === '1' || value === 'true';
    if (typeof value === 'number') return value === 1;
    return false;
  });
  const [publishDate, setPublishDate] = useState(() => {
    const value = (blog as any).publish_date;
    if (value) {
      // If it's a datetime string, extract just the date part (YYYY-MM-DD)
      const dateStr = value.toString();
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
      }
      // If it's already in YYYY-MM-DD format, return as is
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      // Try to parse and format as date
      try {
        const date = new Date(value);
        return date.toISOString().slice(0, 10);
      } catch {
        return '';
      }
    }
    return '';
  });
  
  const categoryOptions = category_blogs.map(category => ({
    value: category.uuid,
    label: category.name
  }));

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

    // Update data.tags with current tags before validation
    const dataWithTags = {
      ...data,
      tags: tags.map(tag => tag.value).join(',')
    };

    const result = blogFormSchema.safeParse(dataWithTags);
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
    
    // Add additional fields
    formData.append('is_published', isPublished ? '1' : '0');
    formData.append('is_featured', isFeatured ? '1' : '0');
    if (publishDate) {
      formData.append('publish_date', publishDate);
    }
    
    // Handle image upload/removal
    if (imageFile) {
        // New image uploaded
        formData.append('image_file', imageFile);
        formData.append('remove_existing_image', '0');
    } else if (removeExistingImage) {
        // User explicitly removed the image
        formData.append('remove_existing_image', '1');
    } else {
        // Keep existing image - send flag to indicate we want to keep it
        formData.append('remove_existing_image', '0');
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

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const handleEditorChange = useCallback((html: string, _delta: any, _quill: any) => {
    setData(prevData => ({ ...prevData, body: html }));
  }, []);
  
  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.blogs_edit")}
        description={t("common.page_descriptions.blogs_edit") || "Edit existing blog post content, images, and metadata."}
      >
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
                      leftIcon={<DocumentTextIcon className="h-5 w-5" />}
                      required
                    />

                    <Input
                      label={t('common.caption')}
                      placeholder={t('common.enter_blog_caption')}
                      value={data.caption}
                      onChange={(e) => setData({ ...data, caption: e.target.value })}
                      error={validationErrors.caption}
                      leftIcon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5" />}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('common.body')} <span className="text-red-500">*</span>
                      </label>
                      <UncontrolledTextEditor
                        defaultValue={initialBodyDelta}
                        onChange={handleEditorChange}
                        placeholder={t('common.enter_blog_body') || "Write your blog content here..."}
                        modules={quillModules}
                        error={validationErrors.body}
                        classNames={{
                          container: "min-h-[300px]"
                        }}
                      />
                      {validationErrors.body && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.body}</p>
                      )}
                    </div>

                    <CoverImageUpload
                      label={t('common.cover_image')}
                      value={imageFile}
                      existingImage={removeExistingImage ? null : (imageFile ? null : (blog.image?.path ? getImageUrl(blog.image.path, "/assets/default/image-placeholder.jpg") : null))}
                      onChange={(file) => {
                        setImageFile(file);
                        if (file) {
                          // New file uploaded - keep existing image logic, but we're replacing it
                          setRemoveExistingImage(false);
                        } else {
                          // File removed - if there was an existing image, mark it for removal
                          if (blog.image?.path && !removeExistingImage) {
                            setRemoveExistingImage(true);
                          }
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
                  
                  <ReactSelect
                    label={t('common.category')}
                    leftIcon={<FolderIcon className="h-5 w-5" />}
                    options={categoryOptions}
                    value={categoryOptions.find(opt => opt.value === data.category_blog_id) || null}
                    onChange={(selected) => {
                      const option = selected as { value: string; label: string } | null;
                      setData({ ...data, category_blog_id: option?.value || '' });
                    }}
                    placeholder={t('common.choose_category')}
                    error={!!validationErrors.category_blog_id}
                    isClearable
                  />
                  {validationErrors.category_blog_id && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.category_blog_id}</p>
                  )}

                  <Tags
                    label={t('common.tags')}
                    placeholder={t('common.enter_tags')}
                    value={tags}
                    onChange={(newTags) => {
                      setTags(newTags);
                      // Clear validation error when tags change
                      if (validationErrors.tags) {
                        setValidationErrors(prev => ({ ...prev, tags: undefined }));
                      }
                    }}
                    error={validationErrors.tags}
                    leftIcon={<TagIcon className="h-5 w-5" />}
                  />
                </Card>

                <Card className="p-4 sm:px-5">
                  <h6 className="dark:text-dark-100 text-base font-medium text-gray-800 mb-4">
                    {t('common.publishing_settings')}
                  </h6>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <EyeIcon className="h-5 w-5" />
                        {t('common.publish_immediately')}
                      </label>
                      <Switch
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        color="primary"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <StarIcon className="h-5 w-5" />
                        {t('common.featured_post')}
                      </label>
                      <Switch
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        color="primary"
                      />
                    </div>

                    <div>
                      <DatePicker
                        label={t('common.publish_date')}
                        value={publishDate}
                        onChange={(dates: Date[]) => {
                          if (dates && dates.length > 0) {
                            const date = new Date(dates[0]);
                            const formattedDate = date.toISOString().slice(0, 10);
                            setPublishDate(formattedDate);
                          } else {
                            setPublishDate('');
                          }
                        }}
                        options={{
                          enableTime: false,
                          dateFormat: "Y-m-d",
                          allowInput: false,
                        }}
                        placeholder={t('common.publish_date') || "Select publish date"}
                      />
                    </div>
                  </div>
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
                      leftIcon={<GlobeAltIcon className="h-5 w-5" />}
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
                      leftIcon={<KeyIcon className="h-5 w-5" />}
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
