import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Textarea } from '@/components/ui';
import { CategoryProduct, CategoryProductFormData } from '@/types/CategoryProducts';
import { useToast } from '@/components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { categoryProductFormSchema } from '@/schemas/categoryProductSchema';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TagIcon } from 'lucide-react';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface CategoryProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryProduct?: CategoryProduct | null;
    errors?: Record<string, string>;
}

export default function CategoryProductFormModal({ isOpen, onClose, categoryProduct, errors }: CategoryProductFormModalProps) {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const isEditing = !!categoryProduct;
    
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        description?: string;
        category_product_id?: string;
    }>({});
    
    const { data, setData, post, put, processing, reset } = useForm<CategoryProductFormData>({
        name: categoryProduct?.name || '',
        description: categoryProduct?.description || '',
        category_product_id: categoryProduct?.category_product_id || undefined,
    });

    React.useEffect(() => {
        if (categoryProduct) {
            setData({
                name: categoryProduct.name,
                description: categoryProduct.description || '',
                category_product_id: categoryProduct.category_product_id || undefined,
            });
        } else {
            reset();
        }
    }, [categoryProduct]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form data with Zod
        const result = categoryProductFormSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setValidationErrors({
                name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                description: errors.description?.[0] ? t(errors.description[0]) : undefined,
                category_product_id: errors.category_product_id?.[0] ? t(errors.category_product_id[0]) : undefined,
            });
            return;
        }
        
        if (isEditing) {
            // Update existing category product using UUID
            put(route('category-products.update', categoryProduct.uuid), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: t('common.category_product_updated_success'),
                        duration: 3000,
                    });
                    setValidationErrors({});
                    onClose();
                    router.reload();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: t('common.category_product_update_error'),
                        duration: 3000,
                    });
                }
            });
        } else {
            // Create new category product
            post(route('category-products.store'), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: t('common.category_product_created_success'),
                        duration: 3000,
                    });
                    reset();
                    setValidationErrors({});
                    onClose();
                    router.reload();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: t('common.category_product_create_error'),
                        duration: 3000,
                    });
                }
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
                                        {isEditing ? t('common.edit_category_product') : t('common.new_category_product')}
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
                                        ? t('common.edit_category_product_info', { name: categoryProduct.name })
                                        : t('common.create_category_product_info')
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
                                                const result = categoryProductFormSchema.safeParse({
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
                                        {(errors?.name || validationErrors.name) && (
                                            <p className="text-red-500 text-sm mt-1">{errors?.name || validationErrors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('common.description_label')}
                                        </label>
                                        <Textarea
                                            id="description"
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder={t('common.description_placeholder')}
                                            rows={3}
                                            className={errors?.description ? 'border-red-500' : ''}
                                        />
                                        {errors?.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end space-x-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClose}
                                            disabled={processing}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
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
