export interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  fixe?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  veterinarian_id?: number;
  user_id?: number;
  created_at: string;
  updated_at?: string;
  pets_count?: number;
}

export interface ClientsDatatableProps {
  clients: {
    data: {
      data: Client[];
    };
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
  old?: any;
  errors?: any;
}

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
}

