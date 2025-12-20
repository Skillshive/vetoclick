// Local Imports
import { Button, Card, Input, Pagination, PaginationItems, PaginationFirst, PaginationLast, PaginationNext, PaginationPrevious } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi2";
import { router } from "@inertiajs/react";
import { PetCard } from "./partials/PetCard";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { Pet, PetsProps } from "./types";
import { useState } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { MagnifyingGlassIcon, InboxIcon } from "@heroicons/react/24/outline";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Index({
  pets,
  filters = {}
}: PetsProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleDeletePet = async (pet: Pet) => {
    // @ts-ignore
    router.delete(route('pets.destroy', pet.uuid), {
      onSuccess: () => {
        showToast({
          type: 'success',
          message: t('common.pet_deleted_success') || 'Pet deleted successfully',
          duration: 3000,
        });
        // Refresh the page to update the pet list
        router.visit(window.location.href, {
          preserveState: false,
          preserveScroll: true
        });
      },
      onError: () => {
        showToast({
          type: 'error',
          message: t('common.pet_delete_error') || 'Error deleting pet',
          duration: 3000,
        });
      }
    });
  };
  
  const petsList = pets?.data || [];
  const meta = pets?.meta || null;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.pets') || 'Pets', path: "/" },
    { title: t('common.pet_management') || 'Pet Management'},
  ];

  return (
    <MainLayout>
      <Page title={t('common.pets') || 'Pets'}>
        <div className="transition-content px-(--margin-x) pb-6 my-5">
          {/* Header with Search and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.manage_pets') || 'Manage your pets'}
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
                    router.visit(route('pets.index') as any, {
                      data: { search: e.target.value, page: 1 },
                      preserveState: true,
                      preserveScroll: true,
                    });
                  }, 500);
                  setSearchTimeout(timeout);
                }}
                placeholder={t('common.search_pets') || 'Search pets...'}
                className=""
                prefix={<MagnifyingGlassIcon className="size-4.5" />}
              />
            
              <Button
                onClick={() => {
                  router.visit(route('pets.create'));
                }}
                variant="filled"
                color="primary"
                className="h-8 gap-2 rounded-md px-3"
              >
                <HiPlus className="w-4 h-4" />
                {/* <span>{t('common.add_pet')}</span> */}
              </Button>
            </div>
          </div>

          {/* Pets Grid */}
          {petsList.length === 0 ? (
            <Card className="p-6 text-center">
              <InboxIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.no_pets_found') || 'No pets found'}</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {petsList.map((pet) => (
                  <PetCard
                    key={pet.uuid}
                    pet={pet}
                    onView={() => {
                      router.visit(route('pets.show', pet.uuid));
                    }}
                    onEdit={() => {
                      router.visit(route('pets.edit', pet.uuid));
                    }}
                    onDelete={() => handleDeletePet(pet)}
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
                      router.visit(route('pets.index') as any, {
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
    </MainLayout>
  );
}

