import type { Role, User } from "@/pages/Users/types";

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
}

export interface Veterinarian {
  uuid: string;
  name: string;
  clinic_name?: string;
}

export interface UsersDatatableProps {
  users: {
    data: {
      data: User[];
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
      first: string | null;
      last: string | null;
      prev: string | null;
      next: string | null;
    };
  };
  roles?: Role[];
  veterinarians?: Veterinarian[];
  filters: {
    search?: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  old?: any;
  errors?: any;
}

export type { User, Role };


