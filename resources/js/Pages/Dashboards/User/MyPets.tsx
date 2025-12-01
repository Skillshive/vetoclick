// Import Dependencies
import { Link } from "@inertiajs/react";
import { PlusIcon, HeartIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

interface Pet {
  uuid: string;
  name: string;
  breed?: string;
  species?: string;
  avatar?: string;
  dob?: Date | string;
}

interface MyPetsProps {
  pets?: Pet[];
}

export function MyPets({ pets = [] }: MyPetsProps) {
  const { t } = useTranslation();

  const calculateAge = (dob: Date | string | undefined): string => {
    if (!dob) return "Unknown";
    const birthDate = dob instanceof Date ? dob : new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  };

  return (
    <Card className="px-4 pb-4 sm:px-5">
      <div className="flex h-14 min-w-0 items-center justify-between py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          {t("common.user_dashboard.my_pets") || "My Pets"}
        </h2>
        <Link
         // href={route("pets.create")}
         href="#"
          className="flex items-center gap-1 border-b border-dotted border-current pb-0.5 text-xs-plus font-medium text-primary-600 outline-hidden transition-colors duration-300 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400/70 dark:focus:text-primary-400/70"
        >
          <PlusIcon className="size-4" />
          {t("common.add") || "Add"}
        </Link>
      </div>
      <div className="space-y-3.5">
        {pets.length > 0 ? (
          pets.map((pet) => (
            <Link
              key={pet.uuid}
           // href={route("pets.show", pet.uuid)}
           href="#"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-dark-500 dark:hover:bg-dark-700/50"
            >
              <Avatar
                size={12}
                name={pet.name}
                initialColor="auto"
                src={pet.avatar}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 dark:text-dark-100 truncate">
                  {pet.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {pet.breed && (
                    <span className="text-xs text-gray-500 dark:text-dark-300 truncate">
                      {pet.breed}
                    </span>
                  )}
                  {pet.dob && (
                    <>
                      <span className="text-xs text-gray-400 dark:text-dark-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-dark-300">
                        {calculateAge(pet.dob)}
                      </span>
                    </>
                  )}
                </div>
                {pet.species && (
                  <span className="text-xs text-gray-400 dark:text-dark-300 mt-1">
                    {pet.species}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <HeartIcon className="size-12 text-gray-300 dark:text-dark-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-dark-300 mb-3">
              {t("common.user_dashboard.no_pets") || "No pets registered yet"}
            </p>
            <Link
            // href={route("pets.create")}
            href="#"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {t("common.add_pet") || "Add your first pet"}
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

