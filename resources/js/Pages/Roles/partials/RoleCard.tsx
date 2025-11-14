import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { HiPencil, HiTrash, HiShieldCheck } from 'react-icons/hi';
import { Role } from '../types';
import { useTranslation } from '@/hooks/useTranslation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RoleCardProps {
    role: Role;
    onEdit: () => void;
    onDelete: () => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
    const { t } = useTranslation();

    // Helper function to translate permission names
    const translatePermissionName = (permissionName: string) => {
        // Convert permission name to translation key format
        // e.g., "users.view" -> "permissions.users.view"
        const translationKey = `permissions.${permissionName}`;
        const translated = t(translationKey);
        
        // If translation doesn't exist, return the original name formatted nicely
        if (translated === translationKey) {
            return permissionName.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return translated;
    };

    // Helper function to translate role names
    const translateRoleName = (roleName: string) => {
        const translationKey = `role_names.${roleName}`;
        const translated = t(translationKey);
        
        // If translation doesn't exist, return the original name formatted nicely
        if (translated === translationKey) {
            return roleName.charAt(0).toUpperCase() + roleName.slice(1);
        }
        
        return translated;
    };

    return (
        <Card className="p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow duration-200 w-full min-h-[200px] flex flex-col">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0">
                        <HiShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {translateRoleName(role.name)}
                        </h3>
                    </div>
                </div>
            </div>
              

            {role.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {role.description}
                </p>
            )}

                <div className="flex items-center space-x-2 mb-3">
                    <Badge
                        color="primary"
                        variant="soft"
                        className="text-xs"
                    >
                        {role.permissions_count || 0} {t('common.permissions')}
                    </Badge>
                </div>

            {role.permissions && role.permissions.length > 0 && (
                <div className="mb-3 flex-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('common.permissions')}:
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 2).map((permission) => (
                            <Badge
                                key={permission.uuid}
                                color="neutral"
                                variant="soft"
                                className="text-xs truncate max-w-[100px] sm:max-w-[120px]"
                            >
                                {translatePermissionName(permission.name)}
                            </Badge>
                        ))}
                        {role.permissions.length > 2 && (
                            <Badge
                                color="neutral"
                                variant="soft"
                                className="text-xs"
                            >
                                +{role.permissions.length - 2} {t('common.more')}
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                    {new Date(role.created_at).toLocaleDateString()}
                </div>
                <div className="flex space-x-1">
                    <Button
                        className="size-6 sm:size-7 rounded-full"
                        isIcon
                        onClick={onEdit}
                        aria-label={t('common.edit')}
                    >
                        <PencilSquareIcon className="size-3 sm:size-4 stroke-2 text-[#4DB9AD]" />
                    </Button>
                    <Button
                        className="size-6 sm:size-7 rounded-full"
                        isIcon
                        onClick={onDelete}
                        aria-label={t('common.delete')}
                    >
                        <TrashIcon className="size-3 sm:size-4 stroke-2 text-red-500" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
