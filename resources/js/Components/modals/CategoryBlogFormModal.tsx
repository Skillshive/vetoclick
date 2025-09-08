import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Textarea } from '@/components/ui';
import ReactSelect from '@/components/ui/ReactSelect';
import { CategoryBlog } from '@/Pages/CategoryBlogs/datatable/types';
import { useToast } from '@/components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TagIcon } from 'lucide-react';
import { categoryBlogFormSchema } from '@/schemas/blogSchema';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface CategoryBlogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryBlog?: CategoryBlog | null;
    parentCategories?: CategoryBlog[];
    errors?: Record<string, string>;
}

interface CategoryBlogFormData {
    name: string;
    desp?: string;
    parent_category_id?: string | null;
}

export default function CategoryBlogFormModal({ isOpen, onClose, categoryBlog, parentCategories = [], errors }: CategoryBlogFormModalProps) {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const isEditing = !!categoryBlog;
    console.log('parentCategories',parentCategories  )
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        desp?: string;
        parent_category_id?: string;
    }>({});

    const { data, setData, reset } = useForm<CategoryBlogFormData>({
        name: categoryBlog?.name || '',
        desp: categoryBlog?.desp || '',
        parent_category_id: categoryBlog?.parent_category_id || null,
    });

    const [processing, setProcessing] = useState(false);

    React.useEffect(() => {
        if (categoryBlog) {
            setData({
                name: categoryBlog.name,
                desp: categoryBlog.desp || '',
                parent_category_id: categoryBlog.parent_category_id || null,
            });
        } else {
            reset();
        }
    }, [categoryBlog]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        const result = categoryBlogFormSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setValidationErrors({
                name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                desp: errors.desp?.[0] ? t(errors.desp[0]) : undefined,
                parent_category_id: errors.parent_category_id?.[0] ? t(errors.parent_category_id[0]) : undefined,
            });
            return;
        }


        setProcessing(true);

        if (isEditing) {
            axios.put(route('category-blogs.update', categoryBlog.uuid), data)
                .then(() => {
                    showToast({
                        type: 'success',
                        message: t('common.category_blog_updated_success'),
                        duration: 3000,
                    });
                    setValidationErrors({});
                    onClose();
                    router.visit(window.location.href, {
                      preserveState: false,
                      preserveScroll: true
                    });
                })
               .catch((error) => {
    if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;
console.log('errors',errors)
        setValidationErrors({
            name: errors?.name ? errors.name[0] : undefined,
            desp: errors?.desp ? errors.desp[0] : undefined,
            parent_category_id: errors?.parent_category_id ? errors.parent_category_id[0] : undefined,
        });

        showToast({
            type: 'error',
            message: errors?.name ? errors.name[0] : t('common.category_blog_update_error'),
            duration: 3000,
        });
    }
})
                .finally(() => {
                    setProcessing(false);
                });
        } else {
            axios.post(route('category-blogs.store'), data)
                .then(() => {
                    showToast({
                        type: 'success',
                        message: t('common.category_blog_created_success'),
                        duration: 3000,
                    });
                    reset();
                    setValidationErrors({});
                    onClose();
                    router.visit(window.location.href, {
                      preserveState: false,
                      preserveScroll: true
                    });
                })
                 .catch((error) => {
    if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;
console.log('errors',errors)
        setValidationErrors({
            name: errors?.name ? errors.name[0] : undefined,
            desp: errors?.desp ? errors.desp[0] : undefined,
            parent_category_id: errors?.parent_category_id ? errors.parent_category_id[0] : undefined,
        });

        showToast({
            type: 'error',
            message: errors?.name ? errors.name[0] : t('common.category_blog_create_error'),
            duration: 3000,
        });
    }
})
                .finally(() => {
                    setProcessing(false);
                });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Transition show={isOpen}>
            <Dialog onClose={handleClose} className="relative z-50">
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {isEditing ? t('common.edit_category_blog') : t('common.new_category_blog')}
                                    </DialogTitle>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    {isEditing
                                        ? t('common.edit_category_blog_info', { name: categoryBlog.name })
                                        : t('common.create_category_blog_info')
                                    }
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('common.category_name_label')}
                                        </label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                             onChange={(e) => {
                                                setData('name', e.target.value);
                                                const result = categoryBlogFormSchema.safeParse({
                                                    ...data,
                                                    name: e.target.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        name: undefined,
                                                    }));
                                                }
                                            }}
                                            placeholder={t('common.category_name_placeholder')}
                                            className={errors?.name || validationErrors.name ? 'border-red-500' : ''}
                                            required
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                       {
                                        (errors?.name || validationErrors.name) && (
                                            <p className="text-red-500 text-sm mt-1">{errors?.name ||validationErrors?.name}</p>
                                        )
                                        }
                                    </div>

                                    <div>
                                        <label htmlFor="parent_category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('common.parent_category_label')}
                                        </label>
                                        <ReactSelect
                                            id="parent_category"
                                            value={
                                                data.parent_category_id
                                                    ? {
                                                        value: data.parent_category_id,
                                                        label: parentCategories?.find(cat => cat.uuid === data.parent_category_id)?.name || ''
                                                    }
                                                    : null
                                            }
                                            onChange={(option) => {
                                                setData('parent_category_id', option ? option.value : null);
                                            }}
                                            options={[
                                                { value: '', label: t('common.no_parent_category') },
                                                ...parentCategories?.filter(cat => !isEditing || cat.uuid !== categoryBlog?.uuid)
                                                    .map((category) => ({
                                                        value: category.uuid,
                                                        label: category.name
                                                    })) || []
                                            ]}
                                            placeholder={t('common.no_parent_category')}
                                            className={errors?.parent_category_id ? 'border-red-500' : ''}
                                            error={!!errors?.parent_category_id}
                                        />
                                       {errors?.parent_category_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.parent_category_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('common.description_label')}
                                        </label>
                                        <Textarea
                                            id="description"
                                            value={data.desp || ''}
                                            onChange={(e) => setData('desp', e.target.value)}
                                            placeholder={t('common.description_placeholder')}
                                            rows={3}
                                            className={errors?.desp ? 'border-red-500' : ''}
                                        />
                                       {errors?.desp && (
                                            <p className="text-red-500 text-sm mt-1">{errors.desp}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end space-x-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={handleClose}
                                            disabled={processing}
                                            >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="filled"
                                            disabled={processing}
                                            color="primary"
                                        >
                                            {processing
                                                ? (isEditing ? t('common.updating') : t('common.creating'))
                                                : (isEditing ? t('common.update') : t('common.create'))
                                            }
                                        </Button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}