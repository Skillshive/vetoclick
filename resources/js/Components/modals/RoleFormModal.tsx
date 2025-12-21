import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Checkbox } from '@/components/ui';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TagIcon } from 'lucide-react';
import { Role, Permission, PermissionGroup, RoleFormData } from '@/pages/Roles/types';
import { roleFormSchema } from '@/schemas/roleSchema';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: Role | null;
    permissions?: Permission[];
    permissionGroups?: PermissionGroup[];
    errors?: Record<string, string>;
}

export default function RoleFormModal({ 
    isOpen, 
    onClose, 
    role, 
    permissions = [], 
    permissionGroups = [],
    errors 
}: RoleFormModalProps) {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const isEditing = !!role;

    const translatePermissionName = (permissionName: string) => {
        const translationKey = `permissions.${permissionName}`;
        const translated = t(translationKey);
        
        // If translation doesn't exist, return the original name formatted nicely
        if (translated === translationKey) {
            return permissionName.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return translated;
    };
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        // description?: string;
        permissions?: string;
    }>({});

    const { data, setData, reset } = useForm<RoleFormData>({
        name: role?.name || '',
        guard_name: role?.guard_name || 'web',
        // description: role?.description || '',
        permissions: role?.permissions?.map(p => p.uuid) || [],
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (role) {
            setData('name', role.name);
            setData('guard_name', role.guard_name || 'web');
            // setData('description', role.description || '');
            setData('permissions', role.permissions?.map(p => p.uuid) || []);
        } else {
            reset();
        }
    }, [role, setData, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = roleFormSchema.safeParse(data);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setValidationErrors({
                name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                // description: errors.description?.[0] ? t(errors.description[0]) : undefined,
                permissions: errors.permissions?.[0] ? t(errors.permissions[0]) : undefined,
            });
            return;
        }

        setProcessing(true);

        const formData = {
            name: data.name,
            guard_name: data.guard_name,
            // description: data.description,
            permissions: data.permissions,
        };

        if (isEditing) {
            axios.post(route('roles.update', role.uuid), formData)
                .then(() => {
                    showToast({
                        type: 'success',
                        message: t('common.role_updated_success'),
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
                            name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                            // description: errors.description?.[0] ? t(errors.description[0]) : undefined,
                            permissions: errors.permissions?.[0] ? t(errors.permissions[0]) : undefined,
                        });
                        showToast({
                            type: 'error',
                            message: errors?.name ? errors.name[0] : t('common.role_update_error'),
                            duration: 3000,
                        });
                    }
                })
                .finally(() => {
                    setProcessing(false);
                });
        } else {
            axios.post(route('roles.store'), formData)
                .then(() => {
                    showToast({
                        type: 'success',
                        message: t('common.role_created_success'),
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
                            name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                            // description: errors.description?.[0] ? t(errors.description[0]) : undefined,
                            permissions: errors.permissions?.[0] ? t(errors.permissions[0]) : undefined,
                        });
                        showToast({
                            type: 'error',
                            message: errors?.name ? errors.name[0] : t('common.role_create_error'),
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

    const handlePermissionChange = (permissionUuid: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        if (checked) {
            setData('permissions', [...data.permissions, permissionUuid]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionUuid));
        }
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        const groupName = permission.group_name || 'Other';
        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

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
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {isEditing ? t('common.edit_role_modal') : t('common.new_role_modal')}
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
                                        ? t('common.edit_role_info', { name: role.name })
                                        : t('common.create_role_info')
                                    }
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            required
                                            label={t('common.role_name_label')}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                const result = roleFormSchema.safeParse({
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
                                            placeholder={t('common.role_name_placeholder')}
                                            className={errors?.name || validationErrors.name ? 'border-red-500' : ''}
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                        {(errors?.name || validationErrors.name) && (
                                            <p className="text-red-500 text-sm mt-1">{errors?.name || validationErrors?.name}</p>
                                        )}
                                    </div>

                                    {/* <div>
                                        <Input
                                            id="description"
                                            type="text"
                                            value={data.description}
                                            label={t('common.description_label')}
                                            onChange={(e) => {
                                                setData('description', e.target.value);
                                                const result = roleFormSchema.safeParse({
                                                    ...data,
                                                    description: e.target.value,
                                                });
                                                if (!result.success) {
                                                    const errors = result.error.flatten().fieldErrors;
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        description: errors.description?.[0] ? t(errors.description[0]) : undefined,
                                                    }));
                                                } else {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        description: undefined,
                                                    }));
                                                }
                                            }}
                                            placeholder={t('common.description_placeholder')}
                                            className={errors?.description || validationErrors.description ? 'border-red-500' : ''}
                                            leftIcon={<TagIcon className="size-5" />}
                                        />
                                        {(errors?.description || validationErrors.description) && (
                                            <p className="text-red-500 text-sm mt-1">{errors?.description || validationErrors?.description}</p>
                                        )}
                                    </div> */}

                                    {/* Permissions Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            {t('common.permissions_breadcrumb')}
                                        </label>
                                        <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                                                <div key={groupName} className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                        {groupName}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {groupPermissions.map((permission) => (
                                                            <Checkbox
                                                                key={permission.uuid}
                                                                checked={data.permissions.includes(permission.uuid)}
                                                                onChange={(event) => handlePermissionChange(permission.uuid, event)}
                                                                label={translatePermissionName(permission.name)}
                                                                className="text-sm mx-1"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {(errors?.permissions || validationErrors.permissions) && (
                                            <p className="text-red-500 text-sm mt-1">{errors?.permissions || validationErrors?.permissions}</p>
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
