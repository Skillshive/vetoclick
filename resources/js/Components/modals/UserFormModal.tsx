import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Avatar, Button, Input, Upload, Select } from '@/components/ui';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TagIcon } from 'lucide-react';
import { User, UserFormData, Role } from '@/pages/Users/types';
import { userFormSchema } from '@/schemas/userSchema';
import { PreviewImg } from "@/components/shared/PreviewImg";
import { HiPencil } from 'react-icons/hi';
import ReactSelect from '../ui/ReactSelect';

declare const route: (name: string, params?: any, absolute?: boolean) => string;


interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    roles?: Role[];
    errors?: Record<string, string>;
}


export default function UserFormModal({ isOpen, onClose, user, roles = [], errors }: UserFormModalProps) {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const isEditing = !!user;
    const [validationErrors, setValidationErrors] = useState<{
        firstname?: string;
        lastname?: string;
        phone?: string;
        email?: string;
        image?: string;
        role?: string;
    }>({});

    const { data, setData, reset } = useForm<UserFormData>({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        phone: user?.phone || '',
        email: user?.email || '',
        image: null,
        role: user?.roles?.[0]?.uuid || '',
        created_at: user?.created_at || '',
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user) {
            setData('firstname', user.firstname);
            setData('lastname', user.lastname);
            setData('phone', user.phone || '');
            setData('email', user.email);
            setData('image', null);
            setData('role', user.roles?.[0]?.uuid || '');
            setData('created_at', user.created_at);
        } else {
            reset();
        }
    }, [user, setData, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = userFormSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setValidationErrors({
                firstname: errors.firstname?.[0] ? t(errors.firstname[0]) : undefined,
                lastname: errors.lastname?.[0] ? t(errors.lastname[0]) : undefined,
                phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                image: errors.image?.[0] ? t(errors.image[0]) : undefined,
                role: errors.role?.[0] ? t(errors.role[0]) : undefined,
            });
            return;
        }

        setProcessing(true);

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('firstname', data.firstname);
        formData.append('lastname', data.lastname);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        if (data.role) {
            formData.append('role', data.role);
        }

        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        if (isEditing) {
            axios.post(route('users.update', user.uuid), formData, config)
                .then(() => {
                    showToast({
                        type: 'success',
                        message: t('common.user_updated_success'),
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
                        setValidationErrors({
                            firstname: errors.firstname?.[0] ? t(errors.firstname[0]) : undefined,
                            lastname: errors.lastname?.[0] ? t(errors.lastname[0]) : undefined, phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                            email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                            image: errors.image?.[0] ? t(errors.image[0]) : undefined,
                            role: errors.role?.[0] ? t(errors.role[0]) : undefined,
                        });
                        showToast({
                            type: 'error',
                            message: errors?.name ? errors.name[0] : t('common.user_update_error'),
                            duration: 3000,
                        });
                    }
                })
                .finally(() => {
                    setProcessing(false);
                });
        } else {
            axios.post(route('users.store'), formData, config)
                .then(() => {
                    showToast({
                        type: 'success',
                        message: t('common.user_created_success'),
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
                        setValidationErrors({
                            firstname: errors.firstname?.[0] ? t(errors.firstname[0]) : undefined,
                            lastname: errors.lastname?.[0] ? t(errors.lastname[0]) : undefined, phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                            email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                            image: errors.image?.[0] ? t(errors.image[0]) : undefined,
                            role: errors.role?.[0] ? t(errors.role[0]) : undefined,
                        });

                        showToast({
                            type: 'error',
                            message: errors?.name ? errors.name[0] : t('common.user_create_error'),
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
                    <div className="flex min-h-full items-center justify-center p-4 overflow-visible">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="transform overflow-visible rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {isEditing ? t('common.edit_user_modal') : t('common.new_user_modal')}
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
                                        ? t('common.edit_user_info', { name: user.name })
                                        : t('common.create_user_info')
                                    }
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    <div className="mt-4 flex flex-col space-y-1.5">
                                        <span className="dark:text-dark-100 text-base font-medium text-gray-800">
                                            {t('common.avatar')}
                                        </span>
                                        <Avatar
                                            size={20}
                                            imgComponent={PreviewImg}
                                            imgProps={{ file: data.image } as any}
                                            src={data.image instanceof File ? URL.createObjectURL(data.image) : (user?.image ? `/storage/${user.image}` : "/assets/default/person-placeholder.jpg")}
                                            classNames={{
                                                root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                                                display: "rounded-xl",
                                            }}
                                            indicator={
                                                <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                                                    {data.image ? (
                                                        <Button
                                                            onClick={() => {
                                                                setData('image', null);
                                                            }}
                                                            isIcon
                                                            className="size-6 rounded-full"
                                                        >
                                                            <XMarkIcon className="size-4" />
                                                        </Button>
                                                    ) : (
                                                        <Upload
                                                            name="avatar"
                                                            onChange={(files: File[]) => {
                                                                const file = files?.[0] || null;

                                                                // update form data
                                                                setData('image', file);

                                                                // validate with zod schema
                                                                const result = userFormSchema.safeParse({
                                                                    ...data,
                                                                    image: file,
                                                                });

                                                                if (!result.success) {
                                                                    const errors = result.error.flatten().fieldErrors;
                                                                    setValidationErrors(prev => ({
                                                                        ...prev,
                                                                        image: errors.image?.[0] ? t(errors.image[0]) : undefined,
                                                                    }));
                                                                } else {
                                                                    setValidationErrors(prev => ({
                                                                        ...prev,
                                                                        image: undefined,
                                                                    }));
                                                                }
                                                            }}
                                                            accept="image/*"
                                                            className={errors?.image || validationErrors.image ? 'border-red-500' : ''}
                                                        >
                                                            {({ ...props }) => (
                                                                <Button isIcon className="size-6 rounded-full" {...props}>
                                                                    <HiPencil className="size-3.5" />
                                                                </Button>
                                                            )}
                                                        </Upload>
                                                    )}

                                                    {
                                                        (errors?.image || validationErrors.image) && (
                                                            <p className="text-red-500 text-sm mt-1">{errors?.image || validationErrors.image}</p>
                                                        )
                                                    }
                                                </div>
                                            }
                                        />
                                    </div>
                                    {/* Form Fields in 2 columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            id="firstname"
                                            type="text"
                                            value={data.firstname}
                                            required
                                            label={t('common.firstname_label')}
                                            onChange={(e) => {
                                                setData('firstname', e.target.value);
                                                const result = userFormSchema.safeParse({
                                                    ...data,
                                                    firstname: e.target.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        firstname: errors.firstname?.[0] ? t(errors.firstname[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        firstname: undefined,
                                                    }));
                                                }
                                            }}
                                            placeholder={t('common.firstname_placeholder')}
                                            className={errors?.firstname || validationErrors.firstname ? 'border-red-500' : ''}
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                        {
                                            (errors?.firstname || validationErrors.firstname) && (
                                                <p className="text-red-500 text-sm mt-1">{errors?.firstname || validationErrors?.firstname}</p>
                                            )
                                        }
                                    </div>

                                    <div>
                                        <Input
                                            id="lastname"
                                            type="text"
                                            value={data.lastname}
                                            required
                                            label={t('common.lastname_label')}
                                            onChange={(e) => {
                                                setData('lastname', e.target.value);
                                                const result = userFormSchema.safeParse({
                                                    ...data,
                                                    lastname: e.target.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        lastname: errors.lastname?.[0] ? t(errors.lastname[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        lastname: undefined,
                                                    }));
                                                }
                                                }}
                                            placeholder={t('common.lastname_placeholder')}
                                            className={errors?.lastname || validationErrors.lastname ? 'border-red-500' : ''}
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                        {
                                            (errors?.lastname || validationErrors.lastname) && (
                                                <p className="text-red-500 text-sm mt-1">{errors?.lastname || validationErrors?.lastname}</p>
                                            )
                                        }
                                    </div>

                                    <div>
                                        <Input
                                            id="email"
                                            type="text"
                                            value={data.email}
                                            label={t('common.email_label')}
                                            required
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                const result = userFormSchema.safeParse({
                                                    ...data,
                                                    email: e.target.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        email: undefined,
                                                    }));
                                                }
                                            }}
                                            placeholder={t('common.email_placeholder')}
                                            className={errors?.email || validationErrors.email ? 'border-red-500' : ''}
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                        {
                                            (errors?.email || validationErrors.email) && (
                                                <p className="text-red-500 text-sm mt-1">{errors?.email || validationErrors?.email}</p>
                                            )
                                        }
                                    </div>

                                    <div>
                                        <Input
                                            id="phone"
                                            type="text"
                                            value={data.phone}
                                            label={t('common.phone_label')}
                                            onChange={(e) => {
                                                setData('phone', e.target.value);
                                                const result = userFormSchema.safeParse({
                                                    ...data,
                                                    phone: e.target.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        phone: undefined,
                                                    }));
                                                }
                                            }}
                                            placeholder={t('common.phone_placeholder')}
                                            className={errors?.phone || validationErrors.phone ? 'border-red-500' : ''}
                                            required
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                        {
                                            (errors?.phone || validationErrors.phone) && (
                                                <p className="text-red-500 text-sm mt-1">{errors?.phone || validationErrors?.phone}</p>
                                            )
                                        }
                                    </div>

                                        {/* Role Selection */}
                                        <div className="md:col-span-2 z-50">
                                        <ReactSelect
                                            id="role"
                                            value={
                                                data.role
                                                    ? {
                                                        value: data.role,
                                                        label: roles?.find(item => item.uuid === data.role)?.name || ''
                                                    }
                                                    : null
                                            }
                                            onChange={(option) => {
                                                setData('role', option ? option.value : null);

                                                const result = userFormSchema.safeParse({
                                                    ...data,
                                                    role: option.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        role: errors.role?.[0] ? t(errors.role[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        role: undefined,
                                                    }));
                                                }
                                            }}
                                            options={roles.map(role => ({
                                                    label: role.display_name || role.name.charAt(0).toUpperCase() + role.name.slice(1),
                                                    value: role.uuid
                                               })) || []
                                            }
                                            placeholder={t('common.roles')}
                                            className={errors?.role ? 'border-red-500' : ''}
                                            error={!!errors?.role}
                                        />
                                         
                                         {
                                            (errors?.role || validationErrors.role) && (
                                                <p className="text-red-500 text-sm mt-1">{errors?.role || validationErrors?.role}</p>
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