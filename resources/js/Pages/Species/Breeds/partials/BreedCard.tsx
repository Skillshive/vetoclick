// Import Dependencies
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { HiScale, HiClock } from "react-icons/hi";

// Local Imports
import { Avatar, Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { getImageUrl } from "@/utils/imageHelper";

// ----------------------------------------------------------------------
// Types
interface Breed {
  uuid: string;
  breed_name: string;
  avg_weight_kg?: number;
  life_span_years?: number;
  image?: string;
  created_at: string;
  updated_at: string;
}

export function BreedCard({
  breed,
  onEdit,
  onDelete
}:{   breed: Breed;
  onEdit: () => void;
  onDelete: () => void; }) {
  const { t } = useTranslation();
  
  return (
    <Card className="flex grow flex-col items-center p-4 text-center sm:p-5 hover:shadow-lg hover:scale-105 transition-all duration-300">
      <Avatar
        size={18}
        src={breed.image ? getImageUrl(breed.image, "/assets/default/species-placeholder.png") : "/assets/default/species-placeholder.png"}
        name={breed.breed_name}
        classNames={{ display: "text-xl" }}
        initialColor="auto"
      />

      <div className="my-2 grow">
        <h3 className="dark:text-dark-100 text-base font-medium text-gray-800">
          {breed.breed_name}
        </h3>
   <div className="space-y-2">
            {breed.avg_weight_kg !== null && breed.avg_weight_kg !== undefined && (
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <HiScale className="w-4 h-4 text-blue-500" />
                <span>{t('common.breed_avg_weight')}: {breed.avg_weight_kg} {t('common.weight_unit')}</span>
              </div>
            )}
            {breed.life_span_years !== null && breed.life_span_years !== undefined && (
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <HiClock className="w-4 h-4 text-green-500" />
                <span>{t('common.breed_life_span')}: {breed.life_span_years} {t('common.years')}</span>
              </div>
            )}
          </div>      </div>
      <div className="mt-3 flex justify-center space-x-1">
        <Button
          className="size-7 rounded-full"
          isIcon
                       onClick={onEdit}
          aria-label={t('common.edit_breed')}
        >
          <PencilSquareIcon className="size-4 stroke-2  text-green-500" />
        </Button>
        <Button
          className="size-7 rounded-full"
          isIcon
                       onClick={onDelete}

          aria-label={t('common.delete_breed')}
        >
          <TrashIcon className="size-4 stroke-2 text-red-500" />
        </Button>
      
      </div>
    </Card>
  );
}
