import MainLayout from '@/layouts/MainLayout';
import SpeciesDatatable from './datatable';
import { SpeciesManagementPageProps } from "@/types/Species";
import { Page } from '@/components/shared/Page';

export default function Index({species, filters}: SpeciesManagementPageProps) {
    return     <MainLayout>
          <Page title="Species">
            <SpeciesDatatable species={species} filters={filters} />
          </Page>
        </MainLayout>
}
