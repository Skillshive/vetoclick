import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface CellProps {
  getValue: () => any;
}

interface ActionsCellProps {
  row: any;
  table: any;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
}


export function SupplierNameCell({ getValue }: CellProps) {
  return (
    <div className="flex max-w-xs items-center space-x-4 2xl:max-w-sm">
      <div className="min-w-0">
        <p className="truncate hover:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors">
            {getValue()}
        </p>
      </div>
    </div>
  );
}

export function EmailCell({ getValue }: CellProps) {
  const email = getValue();
  return (
    <div className="max-w-xs">
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {email}
      </p>
    </div>
  );
}

export function PhoneCell({ getValue }: CellProps) {
  const { t } = useTranslation();

  const phone = getValue();
  return (
    <div className="max-w-xs">
        {phone ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {phone}
        </p>
      ) : (
        <p className="badge-base badge border border-gray-300 text-gray-900 dark:border-surface-1 dark:text-dark-50">
          {t('common.no_phone')}
        </p>
      )}
    </div>
  );
}

export function AddressCell({ getValue }: CellProps) {
  const { t } = useTranslation();

  const address = getValue();
  return (
    <div className="max-w-xs">
        {address ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {address}
        </p>
      ) : (
        <p className="badge-base badge border border-gray-300 text-gray-900 dark:border-surface-1 dark:text-dark-50">
          {t('common.no_description')}
        </p>
      )}
    </div>
  );
}

export function CreatedAtCell({ getValue }: CellProps) {
  const { locale } = useTranslation();
  const createdAt = getValue();
  
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formattedDate = new Date(createdAt).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      {formattedDate}
    </div>
  );
}

export function ActionsCell({ row, table,setSelectedSupplier, setIsModalOpen, onDeleteRow }: ActionsCellProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex justify-center items-center gap-2"> 
        <Button
          type="button"
          variant="flat"
          color="info"
          isIcon
          className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
          title={t('common.edit')}
          onClick={() => {
            setSelectedSupplier(row.original);
            setIsModalOpen(true);
          }}
        >
          <PencilIcon className="size-4 stroke-1.5" />
        </Button>

        <Button
          type="button"
          variant="flat"
          color="error"
          isIcon
          className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
          title={t('common.delete')}
          onClick={() => onDeleteRow?.(row)}
        >
          <TrashIcon className="size-4 stroke-1.5" />
        </Button>
      </div>
    </>
  );
}
