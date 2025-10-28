// Local Imports
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi";
import { router } from "@inertiajs/react";
import { BreedCard } from "./partials/BreedCard";

// Types
interface Breed {
  uuid: string;
  breed_name: string;
  avg_weight_kg?: number;
  life_span_years?: number;
  created_at: string;
  updated_at: string;
}

interface BreedsData {
  data: Breed[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

interface BreedsProps {
  breedsData?: BreedsData;
  speciesId: number;
  speciesUuid: string;
  onCreateBreed?: () => void;
  onEditBreed?: (breed: Breed) => void;
  onDeleteBreed?: (breed: Breed) => void;
}

export default function Breeds({
  breedsData,
  speciesId,
  speciesUuid,
  onCreateBreed,
  onEditBreed,
  onDeleteBreed
}: BreedsProps) {
  const { t } = useTranslation();

  if (!breedsData) {
    return (
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Card className="p-6 text-center">
          <p className="text-gray-500">{t('common.no_breeds_found')}</p>
        </Card>
      </div>
    );
  }

  const { data: breeds, meta } = breedsData;

  return (
    <div className="transition-content w-full px-(--margin-x) pb-8">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('common.breeds')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('common.manage_breeds_for_species')}
          </p>
        </div>
      </div>

      {/* Breeds Grid */}
      {breeds.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">{t('common.no_breeds_found')}</p>
          <Button
            onClick={onCreateBreed}
            className="mt-4"
            color="primary"
          >
            {t('common.create_first_breed')}
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {breeds.map((breed) => (
              <BreedCard
                key={breed.uuid}
                breed={breed}
                onEdit={() => onEditBreed?.(breed)}
                onDelete={() => onDeleteBreed?.(breed)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center space-x-2">
            {meta.last_page > 1 && (
              <>
                <Button
                  onClick={() => {
                    const newPage = Math.max(1, meta.current_page - 1);
                    router.visit(route('species.edit', speciesUuid) as any, {
                      data: { breeds_page: newPage, breeds_per_page: meta.per_page },
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
                      router.visit(route('species.edit', speciesUuid) as any, {
                        data: { breeds_page: page, breeds_per_page: meta.per_page },
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
                    router.visit(route('species.edit', speciesUuid) as any, {
                      data: { breeds_page: newPage, breeds_per_page: meta.per_page },
                      preserveState: true,
                      preserveScroll: true,
                    });
                  }}
                  disabled={meta.current_page === meta.last_page}
                >
                  Next
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}