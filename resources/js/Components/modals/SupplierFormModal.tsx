import React, { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input } from '@/components/ui';
import { Supplier } from '@/types/Suppliers';
import { useToast } from '@/components/common/Toast/ToastContext';
import { EnvelopeIcon, MapIcon, PhoneArrowDownLeftIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supplierSchema, SupplierFormValues } from '@/schemas/supplierSchema';
import { useTranslation } from '@/hooks/useTranslation';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier?: Supplier | null;
    errors?: Record<string, string>;
}

export default function SupplierFormModal({ isOpen, onClose, supplier, errors }: SupplierFormModalProps) {
    const { showToast } = useToast();
    const isEditing = !!supplier;
    const { t } = useTranslation();
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        address?: string;
        email?: string;
        phone?: string;
    }>({});
    const [isValid,setIsValid] = useState(false);

    const { data, setData, post, put, processing, reset } = useForm<SupplierFormValues>({
        name: supplier?.name || '',
        address: supplier?.address || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
    });

    useEffect(() => {
        if (supplier) {
            setData({
                name: supplier.name,
                address: supplier.address,
                email: supplier.email,
                phone: supplier.phone,
            });
        } else {
            reset();
        }
        setIsValid(true);
    }, [supplier]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = supplierSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setValidationErrors({
                name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                address: errors.address?.[0] ? t(errors.address[0]) : undefined,
                email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
            });
            return;
        }

        if (isEditing) {
            put(route('suppliers.update', supplier.uuid), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: t('common.supplier_updated_success'),
                        duration: 3000,
                    });
                    setValidationErrors({});
                    onClose();
                    router.visit(window.location.href, {
                        preserveState: false,
                        preserveScroll: true
                    });
                },
                onError: (errors) => {
                    setValidationErrors({
                        name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                        address: errors.address?.[0] ? t(errors.address[0]) : undefined,
                        email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                        phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                    });
                    showToast({
                        type: 'error',
                        message: t('common.supplier_update_error'),
                        duration: 3000,
                    });
                }
            });
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: t('common.supplier_created_success'),
                        duration: 3000,
                    });
                    reset();
                    setValidationErrors({});
                    onClose();
                    router.visit(window.location.href, {
                        preserveState: false,
                        preserveScroll: true
                    });
                },
                onError: (errors) => {
                    setValidationErrors({
                        name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                        address: errors.address?.[0] ? t(errors.address[0]) : undefined,
                        email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                        phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                    });
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
            <Dialog onClose={handleClose} className="relative z-50" >
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
<DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">                                <div className="flex items-center justify-between mb-4">
                                    <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {isEditing ? t('common.edit_supplier') : t('common.create_supplier')}
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
                                        ? t('common.edit_supplier_info', { name: supplier?.name })
                                        : t('common.create_supplier_info')
                                    }
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Input
                type="name"
                placeholder={t('common.supplier_name')}
                label={t('common.supplier_name')}
                className="rounded-xl"
                required
                prefix={<UserIcon className="size-4.5" />}
                value={data.name}
                onChange={(e) => {
                    setData('name', e.target.value);
                    const result = supplierSchema.safeParse({
                        ...data,
                        name: e.target.value,
                    });
                    if (!result.success) {
                        const errors = result.error.flatten().fieldErrors;
                        setValidationErrors(prev => ({
                            ...prev,
                            name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                        }));
                        setIsValid(false);
                    } else {
                        setValidationErrors(prev => ({
                            ...prev,
                            name: undefined,
                        }));
                        setIsValid(true);
                    }
                }}
            />
            {
                (errors?.name || validationErrors.name) && (
                    <p className="text-red-500 text-sm mt-1">{errors?.name || validationErrors.name}</p>
                )
            }
        </div>

        <div>
            <Input
                type="email"
                placeholder={t('common.supplier_email')}
                label={t('common.supplier_email')}
                className="rounded-xl"
                prefix={<EnvelopeIcon className="size-4.5" />}
                value={data.email}
                required
                onChange={(e) => {
                    setData('email', e.target.value);
                    const result = supplierSchema.safeParse({
                        ...data,
                        email: e.target.value,
                    });

                    if (!result.success) {
                        const errors = result.error.flatten().fieldErrors;
                        setValidationErrors(prev => ({
                            ...prev,
                            email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                        }));
                        setIsValid(false);
                    } else {
                        setValidationErrors(prev => ({
                            ...prev,
                            email: undefined,
                        }));
                        setIsValid(true);
                    }
                }}
            />
            {
                (errors?.email || validationErrors.email) && (
                    <p className="text-red-500 text-sm mt-1">{errors?.email || validationErrors.email}</p>
                )
            }
        </div>

        <div>
            <Input
                type="phone"
                placeholder={t('common.supplier_phone')}
                label={t('common.supplier_phone')}
                className="rounded-xl"
                prefix={<PhoneArrowDownLeftIcon className="size-4.5" />}
                value={data.phone}
                onChange={(e) => {
                    setData('phone', e.target.value);
                    const result = supplierSchema.safeParse({
                        ...data,
                        phone: e.target.value,
                    });
                    if (!result.success) {
                        const errors = result.error.flatten().fieldErrors;
                        setValidationErrors(prev => ({
                            ...prev,
                            phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                        }));
                        setIsValid(false);
                    } else {
                        setValidationErrors(prev => ({
                            ...prev,
                            phone: undefined,
                        }));
                        setIsValid(true);
                    }
                }}
            />
            {
                (errors?.phone || validationErrors.phone) && (
                    <p className="text-red-500 text-sm mt-1">{errors?.phone || validationErrors.phone}</p>
                )
            }
        </div>

        <div>
            <Input
                type="address"
                placeholder={t('common.supplier_address')}
                label={t('common.supplier_address')}
                className="rounded-xl"
                prefix={<MapIcon className="size-4.5" />}
                value={data.address}
                onChange={(e) => {
                    setData('address', e.target.value);
                    const result = supplierSchema.safeParse({
                        ...data,
                        address: e.target.value,
                    });
                    if (!result.success) {
                        const errors = result.error.flatten().fieldErrors;
                        setValidationErrors(prev => ({
                            ...prev,
                            address: errors.address?.[0] ? t(errors.address[0]) : undefined,
                        }));
                    } else {
                        setValidationErrors(prev => ({
                            ...prev,
                            address: undefined,
                        }));
                    }
                }}
            />
            {
                (errors?.address || validationErrors.address) && (
                    <p className="text-red-500 text-sm mt-1">{errors?.address || validationErrors.address}</p>
                )
            }
        </div>
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
