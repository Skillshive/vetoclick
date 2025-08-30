export interface Supplier {
  uuid: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

export interface SuppliersDatatableProps {
  suppliers: {
    data: Supplier[];
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
