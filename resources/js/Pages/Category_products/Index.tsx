import MainLayout from '@/layouts/MainLayout';
import CategoryProductDatatable from './datatable';
import { CategoryProductManagementPageProps } from "@/types/CategoryProducts";
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({categoryProducts, parentCategories, filters}: CategoryProductManagementPageProps) {
    const { t } = useTranslation();

return <MainLayout>
          <Page 
            title={t('common.metadata_titles.category_products_index')}
            description={t("common.page_descriptions.category_products_index") || "Organize products into categories. Manage product categorization and hierarchy."}
          >
            <CategoryProductDatatable
              categoryProducts={categoryProducts}
              parentCategories={parentCategories.data}
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