// Local Imports
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi";
import { router } from "@inertiajs/react";
import { RoleCard } from "./partials/RoleCard";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { Role, RoleManagementPageProps } from "./types";
import RoleFormModal from "../../components/modals/RoleFormModal";
import { useState } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default function Index({
   roles,
   permissions = [],
   permissionGroups = []
}: RoleManagementPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const { showToast } = useToast();
    const confirmContext = useConfirm();

    const { t } = useTranslation();

    const handleDeleteRole = async (role: Role) => {
        const confirmed = await confirmContext.confirm({
            title: t('common.are_you_sure'),
            message: t('common.confirm_delete_role', { name: role.name }),
            confirmLabel: t('common.delete'),
            cancelLabel: t('common.cancel'),
            confirmVariant: "danger"
        });

        if (confirmed) {
            // @ts-ignore
            router.delete(route('roles.destroy', role.uuid), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: t('common.role_deleted_success'),
                        duration: 3000,
                    });
                    // Refresh the page to update the role list
                    router.visit(window.location.href, {
                        preserveState: false,
                        preserveScroll: true
                    });
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: t('common.role_delete_error'),
                        duration: 3000,
                    });
                }
            });
        }
    };

    const rolesList = roles?.data.data || [];
    const meta = roles?.data.meta || null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common.roles'), path: "/" },
        { title: t('common.roles_management')},
      ];

    return (
        <MainLayout>
            <Page title={t('common.roles')}>
                <div className="transition-content px-(--margin-x) pb-6 my-5">
                    {/* Header with Create Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                        <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('common.manage_roles')}
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setSelectedRole(null);
                                setIsModalOpen(true);
                            }}
                            variant="filled"
                            color="primary"
                            className="h-8 gap-2 rounded-md px-3"
                        >
                            <HiPlus className="w-4 h-4" />
                            <span>{t('common.create_role')}</span>
                        </Button>
                    </div>

                    {/* Roles Grid */}
                    {rolesList.length === 0 ? (
                        <Card className="p-6 text-center">
                            <p className="text-gray-500">{t('common.no_roles_found')}</p>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {rolesList.map((role: Role) => (
                                    <RoleCard
                                        key={role.uuid}
                                        role={role}
                                        onEdit={() => {
                                            setSelectedRole(role);
                                            setIsModalOpen(true);
                                        }}
                                        onDelete={() => handleDeleteRole(role)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <div className="mt-6 flex justify-center space-x-2">
                                    <Button
                                        onClick={() => {
                                            const newPage = Math.max(1, meta.current_page - 1);
                                            router.visit(route('roles.index') as any, {
                                                data: { roles_page: newPage, roles_per_page: meta.per_page },
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                        disabled={meta.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                                        <Button
                                            key={page}
                                            onClick={() => {
                                                router.visit(route('roles.index') as any, {
                                                    data: { roles_page: page, roles_per_page: meta.per_page },
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                            color={page === meta.current_page ? 'primary' : 'neutral'}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => {
                                            const newPage = Math.min(meta.last_page, meta.current_page + 1);
                                            router.visit(route('roles.index') as any, {
                                                data: { roles_page: newPage, roles_per_page: meta.per_page },
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                        disabled={meta.current_page === meta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Page>

            <RoleFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRole(null);
                }}
                role={selectedRole}
                permissions={permissions}
                permissionGroups={permissionGroups}
            />
        </MainLayout>
    );
}
