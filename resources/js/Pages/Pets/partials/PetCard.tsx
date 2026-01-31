// Import Dependencies
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Calendar } from "lucide-react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";

// Local Imports
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { getPetAvatarUrl } from "@/utils/imageHelper";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import { Pet } from "../types";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

export function PetCard({
  pet,
  onView,
  onEdit,
  onDelete
}: {
  pet: Pet;
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const confirmContext = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirmContext.confirm({
      title: t('common.are_you_sure'),
      message: t('common.confirm_delete_pet', { name: pet.name }) || `Are you sure you want to delete ${pet.name}?`,
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: "danger"
    });

    if (confirmed) {
      onDelete();
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  const dobFormatted = formatDate(pet.dob);

  return (
    <Card className="relative p-5 hover:shadow-md transition-all duration-200 bg-white dark:bg-dark-700 rounded-xl">
      {/* Kebab Menu - Top Right */}
      <div className="absolute top-4 right-4">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton
            as={Button}
            variant="flat"
            isIcon
            className="size-8 rounded-full bg-gray-50 dark:bg-dark-600 hover:bg-gray-100 dark:hover:bg-dark-500 border-0"
            aria-label={t('common.more_options') || 'More options'}
          >
            <EllipsisVerticalIcon className="size-5 text-gray-500 dark:text-gray-400" />
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {onView && (
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={onView}
                        className={clsx(
                          "flex w-full items-center px-4 py-2 text-sm transition-colors",
                          focus
                            ? "bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-gray-100"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <EyeIcon className="size-4 mr-3" />
                        {t('common.view') || 'View'}
                      </button>
                    )}
                  </MenuItem>
                )}
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={onEdit}
                      className={clsx(
                        "flex w-full items-center px-4 py-2 text-sm transition-colors",
                        focus
                          ? "bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-gray-100"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <PencilSquareIcon className="size-4 mr-3" />
                      {t('common.edit') || 'Edit'}
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={handleDelete}
                      className={clsx(
                        "flex w-full items-center px-4 py-2 text-sm transition-colors",
                        focus
                          ? "bg-gray-100 dark:bg-dark-600"
                          : "",
                        "text-red-600 dark:text-red-400"
                      )}
                    >
                      <TrashIcon className="size-4 mr-3" />
                      {t('common.delete') || 'Delete'}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      {/* Card Content */}
      <div className="flex gap-6 pr-10 items-stretch">
        {/* Left Section - Profile Picture */}
        <div className="flex-shrink-0 w-28">
          <div 
            className="w-full h-full rounded-xl bg-gray-50 dark:bg-dark-600 overflow-hidden border border-gray-100 dark:border-dark-500 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getPetAvatarUrl(pet)})`
            }}
          />
        </div>

        {/* Right Section - Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className="space-y-1.5">
            {/* Name */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {pet.name}
            </h3>
            
            {/* Breed */}
            {pet.breed && (
              <p className="text-sm text-gray-900 dark:text-gray-200 leading-tight">
                {pet.breed.name}
              </p>
            )}

            {/* Date of Birth */}
            {dobFormatted && (
              <p className="text-sm text-gray-900 dark:text-gray-200 leading-tight">
                {t('common.date_of_birth') || 'Date of Birth'}: {dobFormatted}
              </p>
            )}

            {/* Weight */}
            {pet.weight_kg !== null && pet.weight_kg !== undefined && (
              <p className="text-sm text-gray-900 dark:text-gray-200 leading-tight">
                {t('common.weight') || 'Weight'} (kg): <span className="font-bold">{typeof pet.weight_kg === 'number' ? pet.weight_kg.toFixed(2) : Number(pet.weight_kg).toFixed(2)} kg</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Button - Bottom Right */}
      {onView && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="flat"
            isIcon
            onClick={onView}
            className="size-8 rounded-full bg-gray-50 dark:bg-dark-600 hover:bg-gray-100 dark:hover:bg-dark-500 border-0"
            aria-label={t('common.view_appointments') || 'View appointments'}
          >
            <Calendar className="size-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
      )}
    </Card>
  );
}

