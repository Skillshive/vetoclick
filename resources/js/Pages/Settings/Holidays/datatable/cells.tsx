import {
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
  onDeleteRow?: (row: any) => void;
}

export function DateRangeCell({ row }: any) {
  const { t, locale } = useTranslation();
  const { start_date, end_date } = row.original;
  
  const start = new Date(start_date);
  const end = new Date(end_date);
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(dateLocale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formattedRange = start.toDateString() === end.toDateString()
    ? formatDate(start)
    : `${formatDate(start)} - ${formatDate(end)}`;
  
  return (
    <div className="flex max-w-xs items-center space-x-4 2xl:max-w-sm">
      <div className="min-w-0">
        <p className="hover:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors">
          {formattedRange}
        </p>
      </div>
    </div>
  );
}

export function DaysCountCell({ row }: any) {
  const { t } = useTranslation();
  const { start_date, end_date } = row.original;
  
  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return (
    <div className="flex justify-center">
      <Badge color="primary" variant="soft">
        {diffDays} {diffDays === 1 ? (t('common.day') || 'Day') : 'Days'}
      </Badge>
    </div>
  );
}

export function ReasonCell({ getValue }: CellProps) {
  const reason = getValue();
  const { t } = useTranslation();
  
  return (
    <div className="max-w-xs">
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {reason ? (
          <span className="font-medium text-gray-800 dark:text-dark-100">
            {reason}
          </span>
        ) : (
          <Badge color="neutral">
            {t('common.no_reason') || 'No reason'}
          </Badge>
        )}
      </p>
    </div>
  );
}

export function StatusCell({ row }: any) {
  const { t } = useTranslation();
  const { end_date } = row.original;
  const endDate = new Date(end_date);
  const isUpcoming = endDate >= new Date();
  
  return (
    <div className="flex justify-center">
      {isUpcoming ? (
        <Badge variant="soft" color="primary">
          {t('common.upcoming')}
        </Badge>
      ) : (
        <Badge variant="soft" color="error">
          {t('common.past')}
        </Badge>
      )}
    </div>
  );
}

export function ActionsCell({ row, table, onDeleteRow }: ActionsCellProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex justify-center items-center gap-2"> 
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

