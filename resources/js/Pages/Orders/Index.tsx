import MainLayout from '@/layouts/MainLayout';
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';
import { OrdersPageProps } from '@/types/Orders';
import OrderDatatable from './datatable';

export default function OrdersIndex({ orders, filters, dictionaries }: OrdersPageProps) {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <Page title={t('common.orders')}>
        <OrderDatatable
          orders={orders}
          filters={{
            ...filters,
            per_page: filters.per_page || 10,
            sort_by: filters.sort_by || 'order_date',
            sort_direction: filters.sort_direction || 'desc',
          }}
          dictionaries={dictionaries}
        />
      </Page>
    </MainLayout>
  );
}

