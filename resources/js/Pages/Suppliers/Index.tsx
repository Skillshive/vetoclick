import MainLayout from '@/layouts/MainLayout';
import SuppliersDatatable from './datatable';
import { SuppliersManagementPageProps } from "@/types/Suppliers";
import { Page } from '@/components/shared/Page';

export default function Index({suppliers, filters}: SuppliersManagementPageProps) {
    return     <MainLayout>
          <Page title="Suppliers">
            <SuppliersDatatable suppliers={suppliers} filters={filters} />
          </Page>
        </MainLayout>
}
