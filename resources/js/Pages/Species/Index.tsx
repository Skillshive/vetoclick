import SpeciesDatatable from './datatable';
import { SpeciesManagementPageProps } from "@/types/Species";

export default function Index({species, filters}: SpeciesManagementPageProps) {
    return <SpeciesDatatable species={species} filters={filters} />;
}
