import MainLayout from '@/layouts/MainLayout';
import SpeciesDatatable from './datatable';
import { SpeciesManagementPageProps } from "@/types/Species";
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({species, filters}: SpeciesManagementPageProps) {
    const { t } = useTranslation();
    
    return (
        <MainLayout>
            <Page title={t('common.species_management')}>
                <SpeciesDatatable species={species} filters={filters} />
            </Page>
        </MainLayout>
    );
}