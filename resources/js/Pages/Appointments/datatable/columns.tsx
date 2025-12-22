import { ColumnDef } from '@tanstack/react-table';
import { Appointment } from './types';
import { Badge, Avatar } from '@/components/ui';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { CalendarIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PawPrintIcon } from 'lucide-react';

export function createColumns(
  onReport: (appointment: Appointment) => void,
  onCancel: (appointment: Appointment) => void,
  onAccept: (appointment: Appointment) => void,
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
              src={pet.avatar ? `${pet.avatar}` : "/assets/default/image-placeholder.jpg"}
              classNames={{
                display: "mask is-squircle rounded-none text-sm",
              }}
            />
            <div>
              {/* <div className="flex items-center gap-2">
                <span className="dark:text-dark-100 font-medium text-md text-gray-800">
                  {pet.name}
                </span>
                <Badge color="neutral">{pet.breed}</Badge>
              </div> */}
              <div className="hover:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors">
                {client.first_name}{' '}{client.last_name}
              </div>

              <div className="flex items-center text-xs mt-2">
          <div className="flex shrink-0 items-center space-x-1">
            <PawPrintIcon className="dark:text-dark-300 size-4 text-gray-400" />
            <p className="opacity-80"> {pet.name}</p>
          </div>
          <div className="dark:bg-dark-500 mx-2 my-0.5 w-px self-stretch bg-gray-200"></div>
          <p>
            <span>{pet.breed}</span>
          </p>
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
        
        // Map appointment types to badge colors
        const getTypeColor = (type: string): "primary" | "neutral" | "secondary" | "info" | "success" | "warning" | "error" => {
          const typeMap = {
            'consultation': 'primary',
            'checkup': 'success',
            'vaccination': 'info',
            'surgery': 'error',
            'emergency': 'warning',
            'follow-up': 'secondary',
          } as const;
          
          type TypeMapKey = keyof typeof typeMap;
          const lowerType = type?.toLowerCase() as TypeMapKey;
          return (typeMap[lowerType] as "primary" | "neutral" | "secondary" | "info" | "success" | "warning" | "error") || 'primary';
        };

        return appointment_type ? (
          <Badge color={getTypeColor(appointment_type)}>
            {t(`common.${appointment_type}`)}
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
          <div className="dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors">
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
        
        // Map status to badge colors
        const getStatusColor = (status: string): "primary" | "neutral" | "secondary" | "info" | "success" | "warning" | "error" => {
          const statusMap = {
            'scheduled': 'primary',
            'confirmed': 'success',
            'cancelled': 'error',
            'no_show': 'warning',
            'completed': 'info',
          } as const;
          
          type StatusMapKey = keyof typeof statusMap;
          return (statusMap[status as StatusMapKey] as "primary" | "neutral" | "secondary" | "info" | "success" | "warning" | "error") || 'neutral';
        };

        return status ? (
          <Badge color={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <div className="text-center">
            <Badge color={is_video_conseil ? 'primary' : 'neutral'}>
              {is_video_conseil ? t('common.yes') : t('common.no')}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'reason_for_visit',
      header: t('common.reason_for_visit'),
      cell: ({ row }) => {
        return (
          <span className="dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors">
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
  
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
        return (
          <span className="dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors">
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
        const isScheduled = appointment.status === 'scheduled';

        return (
          <div className="flex justify-center items-center gap-2"> 
            {isScheduled && (
              <Button
                type="button"
                variant="flat"
                color="success"
                isIcon
                className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-green-50 dark:hover:bg-green-900/20"
                title={t('common.accept_appointment') || 'Accept Appointment'}
                onClick={() => onAccept(appointment)}
              >
                <CheckCircleIcon className="size-4 stroke-1.5" />
              </Button>
            )}
            
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
