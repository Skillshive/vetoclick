import { PaginationMeta, PaginationLinks } from "./Pagination";
import { Filters } from "./Filters";

export interface Species {
    id: number;
    uuid: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    breeds?: Breed[];
}

export interface Breed {
    id: number;
    uuid: string;
    name: string;
    description?: string;
    species_id: number;
    species?: Species;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface SpeciesResource {
    data: Species[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface SpeciesManagementPageProps {
    species: SpeciesResource;
    filters: Filters & {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_direction?: string;
    };
    error?: string;
}

export interface SpeciesFormData {
    name: string;
    description?: string;
}

export interface SpeciesShowPageProps {
    species: Species;
}

export interface SpeciesCreatePageProps {
    errors?: Record<string, string>;
}

export interface SpeciesEditPageProps {
    species: Species;
    errors?: Record<string, string>;
}
