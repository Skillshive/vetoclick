import MainLayout from '@/layouts/MainLayout';
import CategoryProductDatatable from './datatable';
import { CategoryProductManagementPageProps } from "@/types/CategoryProducts";
import { Page } from '@/components/shared/Page';

export default function Index({categoryProducts, filters}: CategoryProductManagementPageProps) {
    return <MainLayout>
          <Page title="Category Products">
            <CategoryProductDatatable categoryProducts={categoryProducts} filters={filters} />
          </Page>
        </MainLayout>
}