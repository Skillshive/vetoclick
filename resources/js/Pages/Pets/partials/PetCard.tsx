// Import Dependencies
import { PencilSquareIcon, TrashIcon, HeartIcon, EyeIcon } from "@heroicons/react/24/outline";
import { PawPrint } from "lucide-react";

// Local Imports
import { Avatar, Button, Card, Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { getPetAvatarUrl } from "@/utils/imageHelper";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import { Pet } from "../types";

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

  const getGenderLabel = (sex: number) => {
    return sex === 1 ? t('common.female') || 'Female' : t('common.male') || 'Male';
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="flex grow flex-col items-center p-4 text-center sm:p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 min-h-[200px]">
      <Avatar
        size={18}
        src={getPetAvatarUrl(pet)}
        name={pet.name}
        classNames={{ display: "text-xl" }}
        initialColor="auto"
      />

<div className="my-2 grow w-full flex flex-col items-center text-center">
<h3 className="dark:text-dark-100 text-base font-medium text-gray-800 mb-3">
          {pet.name}
        </h3>
        
        <div className="space-y-2 w-full">
          {pet.breed && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <PawPrint className="w-4 h-4 text-[#4DB9AD] flex-shrink-0" />
              <span className="truncate min-w-0">{pet.breed.name}</span>
            </div>
          )}
         
          {pet.client && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <HeartIcon className="w-4 h-4 text-[#4DB9AD] flex-shrink-0" />
              <span className="truncate min-w-0">
                {pet.client.first_name} {pet.client.last_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <Badge
              color="primary"
              variant="soft"
              className="text-xs"
            >
              {getGenderLabel(pet.sex)}
            </Badge>
          </div>

          {pet.dob && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('common.date_of_birth')}: {formatDate(pet.dob)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-center space-x-1">
        {onView && (
          <Button
            className="size-7 rounded-full"
            isIcon
            onClick={onView}
            aria-label={t('common.view_pet') || 'View pet'}
          >
            <EyeIcon className="size-4 stroke-2 text-blue-500" />
          </Button>
        )}
        <Button
          className="size-7 rounded-full"
          isIcon
          onClick={onEdit}
          aria-label={t('common.edit_pet') || 'Edit pet'}
        >
          <PencilSquareIcon className="size-4 stroke-2 text-[#4DB9AD]" />
        </Button>
        <Button
          className="size-7 rounded-full"
          isIcon
          onClick={handleDelete}
          aria-label={t('common.delete_pet') || 'Delete pet'}
        >
          <TrashIcon className="size-4 stroke-2 text-red-500" />
        </Button>
      </div>
    </Card>
  );
}

