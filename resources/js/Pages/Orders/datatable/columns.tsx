import { ColumnDef } from '@tanstack/react-table';
import { Order } from './types';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function createColumns(
  onEdit: (order: Order) => void,
  onDelete: (order: Order) => void,
  t: (key: string) => string
): ColumnDef<Order>[] {

  return [
    {
      accessorKey: 'reference',
      header: t('common.reference'),
      cell: ({ row }) => {
        return (
          <span className="dark:text-dark-100 font-medium text-gray-800">
            {row.getValue('reference')}
          </span>
        );
      },
    },
    {
      accessorKey: 'supplier',
      header: t('common.supplier'),
      cell: ({ row }) => {
        const supplier = row.original.supplier;
        return (
          <span className="dark:text-dark-100 font-medium text-gray-700">
            {supplier?.name || t('common.no_data')}
          </span>
        );
      },
      accessorFn: (row) => row.supplier?.name || '',
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'order_type',
      header: t('common.order_type'),
      cell: ({ row }) => {
        const order_type = row.getValue('order_type') as string;
        
        const getTypeColor = (type: string): "primary" | "error" => {
          const typeMap = {
            'regular': 'primary',
            'emergency': 'error',
          } as const;
          
          type TypeMapKey = keyof typeof typeMap;
          const lowerType = type?.toLowerCase() as TypeMapKey;
          return (typeMap[lowerType] as "primary" | "error") || 'primary';
        };

        return order_type ? (
          <Badge color={getTypeColor(order_type)}>
            {order_type.toUpperCase()}
          </Badge>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        
        const getStatusColor = (status: string): "primary" | "neutral" | "secondary" | "info" | "success" | "warning" | "error" => {
          const statusMap = {
            'pending': 'warning',
            'approved': 'success',
            'cancelled': 'error',
            'completed': 'info',
            'received': 'success',
            'draft': 'neutral',
            'confirmed': 'info',
            'shipped': 'info',
            'returned': 'warning',
          } as const;
          
          type StatusMapKey = keyof typeof statusMap;
          return (statusMap[status as StatusMapKey] as "primary" | "neutral" | "secondary" | "info" | "success" | "warning" | "error") || 'neutral';
        };

        return status ? (
          <Badge color={getStatusColor(status)}>
            {status.toUpperCase()}
          </Badge>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'total_amount',
      header: t('common.total_amount'),
      cell: ({ row }) => {
        const { locale } = useTranslation();
        const amount = row.getValue('total_amount') as string;
        return (
          <span className="dark:text-dark-100 font-medium text-gray-800">
            {amount + ' ' + (locale === 'ar' ? 'د.م' : 'MAD')}
          </span>
        );
      },
    },
    {
      accessorKey: 'order_date',
      header: t('common.order_date'),
      cell: ({ row }) => {
        const { locale } = useTranslation();
        const date = row.getValue('order_date') as string;
        if (!date) return <span className="text-gray-400">{t('common.no_data')}</span>;
        
        const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
        const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <span className="dark:text-dark-100 font-medium text-gray-700">
            {formattedDate}
          </span>
        );
      },
    },
    {
      accessorKey: 'payment_due_date',
      header: t('common.payment_due_date'),
      cell: ({ row }) => {
        const { locale } = useTranslation();
        const date = row.getValue('payment_due_date') as string;
        if (!date) return <span className="text-gray-400">{t('common.no_data')}</span>;
        
        const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
        const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <span className="dark:text-dark-100 font-medium text-gray-700">
            {formattedDate}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: "",
      cell: ({ row }) => {
        const order = row.original;

        return (
          <div className="flex justify-center items-center gap-2"> 
            <Button
              type="button"
              variant="flat"
              color="info"
              isIcon
              className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
              title={t('common.edit')}
              onClick={() => onEdit(order)}
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
              onClick={() => onDelete(order)}
            >
              <TrashIcon className="size-4 stroke-1.5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

