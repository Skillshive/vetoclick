import { PaginationMeta, PaginationLinks } from "./Pagination";
import { Filters } from "./Filters";

export interface CategoryProduct {
    id: number;
    uuid: string;
    name: string;
    description?: string;
    category_product_id?: number;
    parent_category?: CategoryProduct;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CategoryProductResource {
    data: CategoryProduct[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface CategoryProductManagementPageProps {
    categoryProducts: CategoryProductResource;
    filters: Filters & {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_direction?: string;
    };
    error?: string;
}

export interface CategoryProductFormData {
    name: string;
    description?: string;
    category_product_id?: number;
}

export interface CategoryProductShowPageProps {
    categoryProduct: CategoryProduct;
}

export interface CategoryProductCreatePageProps {
    errors?: Record<string, string>;
}

export interface CategoryProductEditPageProps {
    categoryProduct: CategoryProduct;
    errors?: Record<string, string>;
}
