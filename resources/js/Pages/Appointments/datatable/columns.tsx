import { ColumnDef } from '@tanstack/react-table';
import { Appointment } from './types';
import { Badge, Avatar } from '@/components/ui';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { CalendarIcon, XCircleIcon } from '@heroicons/react/24/outline';

export function createColumns(
  onReport: (appointment: Appointment) => void,
  onCancel: (appointment: Appointment) => void,
  t: (key: string) => string
): ColumnDef<Appointment>[] {

  return [
    {
      accessorKey: 'client_pet',
      header: t('common.client'),
      cell: ({ row }) => {
        const { client, pet } = row.original;
        return (
          <div className="flex items-center gap-4">
            <Avatar
              size={9}
              name={pet.name}
              src={pet.avatar ? `/storage/${pet.avatar}` : "/assets/default/image-placeholder.jpg"}
              classNames={{
                display: "mask is-squircle rounded-none text-sm",
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="dark:text-dark-100 font-medium text-md text-gray-800">
                  {pet.name}
                </span>
                <Badge color="neutral">{pet.breed}</Badge>
              </div>
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {client.first_name} {client.last_name}
              </div>
            </div>
          </div>
        );
      },
    },
    
    {
      accessorKey: 'appointment_type',
      header: t('common.type'),
      cell: ({ row }) => {
        const appointment_type = row.getValue('appointment_type') as string;
        return appointment_type ? (
          <Badge color="info">
            {appointment_type}
          </Badge>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'appointment_date',
      header: t('common.date'),
      cell: ({ row }) => {
        const { locale } = useTranslation();
        const date = new Date(row.getValue('appointment_date'));
        const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
        const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <div className="text-gray-900 dark:text-gray-100">
            <div>{formattedDate}</div>
            <div>{row.original.start_time}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return status ? (
          <Badge color="info">
            {status}
          </Badge>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_video_conseil',
      header: t('common.is_video_conseil'),
      cell: ({ row }) => {
        const is_video_conseil = row.getValue('is_video_conseil');
        return (
          <Badge color={is_video_conseil ? 'success' : 'neutral'}>
            {is_video_conseil ? t('common.yes') : t('common.no')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'reason_for_visit',
      header: t('common.reason_for_visit'),
      cell: ({ row }) => {
        return (
          <span className="text-gray-900 dark:text-gray-100">
            {row.getValue('reason_for_visit')}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('common.created_at'),
      cell: ({ row }) => {
        const { locale } = useTranslation();
        const date = new Date(row.getValue('created_at'));
  
  // Use appropriate locale for date formatting
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
        return (
          <span className="text-gray-900 dark:text-gray-100">
            {formattedDate}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: "",
      cell: ({ row }) => {
        const appointment = row.original;
        const isCancellable = appointment.status !== 'cancelled' && appointment.status !== 'passed';

        return (
          <div className="flex justify-center items-center gap-2"> 
            {isCancellable && (
              <Button 
                component="a"
                onClick={() => {
                  onReport(appointment);
                }}
                type="button"
                variant="flat"
                color="info"
                isIcon
                className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
                title={t('common.report')}
              >
                <CalendarIcon className="size-4 stroke-1.5" />
              </Button>
            )}
    
            {isCancellable && (
              <Button
                type="button"
                variant="flat"
                color="error"
                isIcon
                className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
                title={t('common.cancel')}
                onClick={() => onCancel(appointment)}
              >
                <XCircleIcon className="size-4 stroke-1.5" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
