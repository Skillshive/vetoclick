import MainLayout from '@/layouts/MainLayout';
import CategoryProductDatatable from './datatable';
import { CategoryProductManagementPageProps } from "@/types/CategoryProducts";
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({categoryProducts, parentCategories, filters}: CategoryProductManagementPageProps) {
    const { t } = useTranslation();

    return <MainLayout>
          <Page title={t('common.category_products')}>
            <CategoryProductDatatable
              categoryProducts={categoryProducts}
              parentCategories={parentCategories}
              filters={{
                ...filters,
                per_page: filters.per_page || 10,
                sort_by: filters.sort_by || 'name',
                sort_direction: filters.sort_direction || 'asc'
              }}
            />
          </Page>
        </MainLayout>
}