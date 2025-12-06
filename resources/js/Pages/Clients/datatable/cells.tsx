import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Badge, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface CellProps {
  getValue: () => any;
}

interface ActionsCellProps {
  row: any;
  table: any;
  setSelectedClient: (client: any) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
}

export function ClientNameCell({ getValue, row }: any) {
  const { first_name, last_name } = row.original;
  
  return (
    <div className="flex max-w-xs items-center space-x-4 2xl:max-w-sm">
      <div className="min-w-0">
        <p className="truncate">
          <a
            href="##"
            className="hover:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors"
          >
            {first_name} {last_name}
          </a>
        </p>
      </div>
    </div>
  );
}

export function EmailCell({ getValue }: CellProps) {
  const email = getValue();
  const { t } = useTranslation();
  return (
    <div className="max-w-xs">
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {email ? <a href={`mailto:${email}`} className="hover:text-primary-600 dark:hover:text-primary-400  transition-colors font-medium text-gray-800 dark:text-dark-100">
            {email}
          </a> : <Badge color="neutral">
            {t('common.no_email')}
          </Badge>}
      </p>
    </div>
  );
}

export function PhoneCell({ getValue }: CellProps) {
  const phone = getValue();
  const { t } = useTranslation();
  return (
    <div className="max-w-xs">
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {phone ? <a href={`tel:${phone}`} className="hover:text-primary-600 dark:hover:text-primary-400  transition-colors font-medium text-gray-800 dark:text-dark-100">
            {phone}
          </a> : <Badge color="neutral">
            {t('common.no_phone')}
          </Badge>}
      </p>
    </div>
  );
}

export function AddressCell({ getValue, row }: any) {
  const { address, city, postal_code } = row.original;
  const fullAddress = [address, city, postal_code].filter(Boolean).join(', ');
  const { t } = useTranslation();
  return (
    <div className="max-w-xs">
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {fullAddress ? <p className="hover:text-primary-600 dark:hover:text-primary-400  transition-colors font-medium text-gray-800 dark:text-dark-100">
            {fullAddress}
          </p> : <Badge color="neutral">
            {t('common.no_information')}
          </Badge>}
      </p>
    </div>
  );
}

export function PetsCountCell({ getValue }: CellProps) {
  const count = getValue() || 0;
  
  return (
    <div className="flex justify-center">
      <Badge color={count > 0 ? "primary" : "secondary"} variant="soft">
        {count}
      </Badge>
    </div>
  );
}

export function CreatedAtCell({ getValue }: CellProps) {
  const createdAt = getValue();
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
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

export function ActionsCell({ row, table, setSelectedClient, setIsModalOpen, onDeleteRow }: ActionsCellProps) {
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
            setSelectedClient(row.original);
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

