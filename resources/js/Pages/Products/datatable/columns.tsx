import { ColumnDef } from '@tanstack/react-table';
import { Product } from './types';
import { Badge, Avatar } from '@/components/ui';
import { Button } from '@/components/ui';
import { HiPencil, HiTrash } from 'react-icons/hi';
import { useTranslation } from '@/hooks/useTranslation';
import { PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';

export function createColumns(
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  onViewLots: (product: Product) => void,
  t: (key: string) => string
): ColumnDef<Product>[] {

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: t('common.product_name'),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-4">
          <Avatar
            size={9}
            name={product.name || 'Product'}
            src={product.image ? `/storage/${product.image}` :  "/assets/default/image-placeholder.jpg"}
            classNames={{
              display: "mask is-squircle rounded-none text-sm",
            }}
          />
          <span className="dark:text-dark-100 font-medium text-gray-800">
           <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {product.name}
              </div>
              {product.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {product.description}
                </div>
              )}
            </div>
          </span>
        </div>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: t('common.product_sku'),
      cell: ({ row }) => {
        const sku = row.getValue('sku') as string;
        return sku ? (
          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
            {sku}
          </span>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'brand',
      header: t('common.product_brand'),
      cell: ({ row }) => {
        const brand = row.getValue('brand') as string;
        return brand ? (
          <span className="text-gray-900 dark:text-gray-100">
            {brand}
          </span>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'category',
      header: t('common.product_category'),
      cell: ({ row }) => {
        const category = row.original.category;
        return category?.name ? (
          <span className="text-gray-900 dark:text-gray-100">
            {category.name}
          </span>
        ) : (
          <Badge color="neutral">
            {t('common.no_data')}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.category?.id?.toString() || '');
      },
    },
    {
      accessorKey: 'type',
      header: t('common.product_type'),
      cell: ({ row }) => {
        const type = row.getValue('type') as number;
        const getTypeLabel = (type?: number) => {
          switch (type) {
            case 1: return t('common.product_type_medication');
            case 2: return t('common.product_type_vaccine');
            case 3: return t('common.product_type_supplement');
            case 4: return t('common.product_type_equipment');
            default: return 'N/A';
          }
        };
        return (
          <span className="text-gray-900 dark:text-gray-100">
            {getTypeLabel(type)}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.type?.toString() || '');
      },
    },
    {
      accessorKey: 'availability_status',
      header: t('common.status'),
      cell: ({ row }) => {
        const product = row.original;
        const getAvailabilityBadge = (status?: number) => {
          switch (status) {
            case 1:
              return <Badge color="success">Available</Badge>;
            case 2:
              return <Badge color="error">Out of Stock</Badge>;
            case 4:
              return <Badge color="info">On Order</Badge>;
            default:
              return <Badge color="neutral">{t('common.no_data')}</Badge>;
          }
        };

        return getAvailabilityBadge(product.availability_status);
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.availability_status?.toString() || '');
      },
    },
    {
      accessorKey: 'minimum_stock_level',
      header: t('common.stock'),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="text-sm">
            <div>Min: {product.minimum_stock_level || 0}</div>
            <div>Max: {product.maximum_stock_level || 0}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'vaccine_info',
      header: t('common.vaccine_info'),
      cell: ({ row }) => {
        const product = row.original;
        if (product.type !== 2) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="text-sm">
            {product.manufacturer && (
              <div className="font-medium">{product.manufacturer}</div>
            )}
            {product.batch_number && (
              <div className="text-gray-500">Batch: {product.batch_number}</div>
            )}
            {product.expiry_date && (
              <div className="text-gray-500">Exp: {new Date(product.expiry_date).toLocaleDateString()}</div>
            )}
          </div>
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
        const product = row.original;
        return (
          <div className="flex justify-center items-center gap-2"> 

            <Button 
              type="button"
              variant="flat"
              color="primary"
              isIcon
              className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
              title={t('common.view_lots') || 'View Lots'}
              onClick={() => onViewLots(product)}
            >
              <CubeIcon className="size-4 stroke-1.5" />
            </Button>

            <Button 
              component="a"
              onClick={() => {
                onEdit(product);
              }}
              type="button"
              variant="flat"
              color="info"
                isIcon
              className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
              title={t('common.edit')}
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
              onClick={() => onDelete(product)}
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
