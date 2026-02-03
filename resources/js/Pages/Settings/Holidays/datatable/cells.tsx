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

// Helper function to parse datetime string as local time
function parseLocalDateTime(dateString: string): Date {
  if (!dateString) return new Date();
  
  // If the string is in "YYYY-MM-DD HH:mm:ss" format, parse it as local time
  const dateTimeMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute, second] = dateTimeMatch;
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1, // Month is 0-indexed
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    );
  }
  
  // Fallback to standard Date parsing
  return new Date(dateString);
}

export function DateRangeCell({ row }: any) {
  const { t, locale } = useTranslation();
  const { start_date, end_date } = row.original;
  
  const start = parseLocalDateTime(start_date);
  const end = parseLocalDateTime(end_date);
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString(dateLocale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formattedRange = start.toDateString() === end.toDateString()
    ? formatDateTime(start) + ' - ' + end.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
    : `${formatDateTime(start)} - ${formatDateTime(end)}`;
  
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
  
  const start = parseLocalDateTime(start_date);
  const end = parseLocalDateTime(end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let durationText = '';
  if (diffDays > 0) {
    durationText = `${diffDays} ${diffDays === 1 ? (t('common.day') || 'Day') : (t('common.days_label') || 'Days')}`;
    if (diffHours % 24 > 0) {
      durationText += ` ${diffHours % 24}h`;
    }
  } else if (diffHours > 0) {
    durationText = `${diffHours} ${diffHours === 1 ? (t('common.hour') || 'Hour') : (t('common.hours') || 'Hours')}`;
    if (diffMinutes > 0) {
      durationText += ` ${diffMinutes}${t('common.minutes_short') || 'm'}`;
    }
  } else {
    durationText = `${diffMinutes} ${diffMinutes === 1 ? (t('common.minute') || 'Minute') : (t('common.minutes') || 'Minutes')}`;
  }
  
  return (
    <div className="flex justify-center">
      <Badge color="primary" variant="soft">
        {durationText}
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
  const endDate = parseLocalDateTime(end_date);
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

