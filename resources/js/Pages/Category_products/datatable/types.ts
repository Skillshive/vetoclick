import { CategoryProduct } from "@/types/CategoryProducts";

export interface CategoryProductDatatableProps {
  categoryProducts: {
    data: CategoryProduct[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
  };
  parentCategories: CategoryProduct[];
  filters: {
    search?: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
}

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
}