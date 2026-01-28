export interface Holiday {
  uuid: string;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HolidaysDatatableProps {
  holidays?: Holiday[];
  filters?: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
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

