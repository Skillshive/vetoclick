// Local Imports
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi";
import { router } from "@inertiajs/react";
import { UserCard } from "./partials/UserCard";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { User, UsersProps } from "./types";
import UserFormModal from "@/components/modals/UserFormModal";
import { useState } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";


export default function Index({
   users
}: UsersProps) {
       const [isModalOpen, setIsModalOpen] = useState(false);
         const [selectedUser, setSelectedUser] = useState<User | null>(null);
       const { showToast } = useToast();

   const { t } = useTranslation();

   const handleDeleteUser = async (user: User) => {
     // @ts-ignore
     router.delete(route('users.destroy', user.uuid), {
       onSuccess: () => {
         showToast({
           type: 'success',
           message: t('common.user_deleted_success'),
           duration: 3000,
         });
         // Refresh the page to update the user list
         router.visit(window.location.href, {
           preserveState: false,
           preserveScroll: true
         });
       },
       onError: () => {
         showToast({
           type: 'error',
           message: t('common.user_delete_error'),
           duration: 3000,
         });
       }
     });
   };
console.log("users",users);

  const usersList = users?.data.data || [];
  const meta = users?.meta || null;

  return (
    <MainLayout>
            <Page title={t('common.users')}>
          <div className="transition-content px-(--margin-x) pb-6 my-5">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('common.users')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.manage_users')}
          </p>
        </div>
        <Button
onClick= {() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}          variant="filled"
          color="primary"
          className="h-8 gap-2 rounded-md px-3"
        >
          <HiPlus className="w-4 h-4" />
          <span>{t('common.create_users')}</span>
        </Button>
      </div>

      {/* users Grid */}
      {usersList.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">{t('common.no_users_found')}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {usersList.map((user) => (
              <UserCard
                key={user.uuid}
                user={user}
                onEdit= {() => {
            setSelectedUser(user);
            setIsModalOpen(true);
          }}
                onDelete={() => handleDeleteUser(user)}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <Button
                onClick={() => {
                  const newPage = Math.max(1, meta.current_page - 1);
                  router.visit(route('users.index') as any, {
                    data: { users_page: newPage, users_per_page: meta.per_page },
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
                  router.visit(route('users.index') as any, {
                      data: { users_page: page, users_per_page: meta.per_page },
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
                  router.visit(route('users.index') as any, {
                    data: { users_page: newPage, users_per_page: meta.per_page },
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

         <UserFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
    </MainLayout>
  );
}