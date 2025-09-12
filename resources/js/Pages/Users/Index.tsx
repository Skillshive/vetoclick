// Local Imports
import { Button, Card, Input, Pagination, PaginationItems, PaginationFirst, PaginationLast, PaginationNext, PaginationPrevious } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import { router } from "@inertiajs/react";
import { UserCard } from "./partials/UserCard";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { User, UsersProps } from "./types";
import UserFormModal from "@/components/modals/UserFormModal";
import { useState, useEffect } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";


export default function Index({
   users,
   roles = [],
   filters = {}
}: UsersProps) {
       const [isModalOpen, setIsModalOpen] = useState(false);
         const [selectedUser, setSelectedUser] = useState<User | null>(null);
       const [searchQuery, setSearchQuery] = useState(filters.search || '');
       const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
       const { showToast } = useToast();

   const { t } = useTranslation();
console.log("users",users);
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

  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.users'), path: "/" },
    { title: t('common.users_management')},
  ];

  return (
    <MainLayout>
            <Page title={t('common.users')}>
          <div className="transition-content px-(--margin-x) pb-6 my-5">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.manage_users')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
        <Input
              classNames={{
                input: "text-xs-plus h-9 rounded-full",
                root: "max-sm:hidden",
              }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Clear existing timeout
                if (searchTimeout) {
                  clearTimeout(searchTimeout);
                }
                // Set new timeout for debounced search
                const timeout = setTimeout(() => {
                  router.visit(route('users.index') as any, {
                    data: { search: e.target.value, page: 1 },
                    preserveState: true,
                    preserveScroll: true,
                  });
                }, 500);
                setSearchTimeout(timeout);
              }}              placeholder={t('common.search_users')}
              className=""
              prefix={<MagnifyingGlassIcon className="size-4.5" />}
            />
          
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            variant="filled"
            color="primary"
            className="h-8 gap-2 rounded-md px-3"
          >
            <HiPlus className="w-4 h-4" />
            <span>{t('common.create_users')}</span>
          </Button>
        </div>
      </div>

      {/* users Grid */}
      {usersList.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">{t('common.no_users_found')}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <div className="mt-6 flex justify-center">
              <Pagination
                total={meta.last_page}
                value={meta.current_page}
                onChange={(page) => {
                  router.visit(route('users.index') as any, {
                    data: { 
                      page: page, 
                      per_page: meta.per_page,
                      search: searchQuery 
                    },
                    preserveState: true,
                    preserveScroll: true,
                  });
                }}
                className="flex items-center gap-1"
              >
                <PaginationPrevious />
                <PaginationItems />
                <PaginationNext />
              </Pagination>
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
                roles={roles}
            />
    </MainLayout>
  );
}