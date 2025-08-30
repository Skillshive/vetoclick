import { PaginationMeta, PaginationLinks } from "./Pagination";
import { Filters } from "./Filters";

export interface Supplier {
    id: number;
    uuid: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface SupplierResource {
    data: Supplier[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface SuppliersManagementPageProps {
    suppliers: SupplierResource;
    filters: Filters & {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_direction?: string;
    };
    error?: string;
}

export interface SupplierFormData {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface SupplierShowPageProps {
    supplier: Supplier;
}

export interface SupplierCreatePageProps {
    errors?: Record<string, string>;
}

export interface SupplierEditPageProps {
    supplier: Supplier;
    errors?: Record<string, string>;
}
