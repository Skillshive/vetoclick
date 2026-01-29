import type { Role, Permission, PermissionGroup } from "../types";

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
}

export interface RolesDatatableProps {
  roles: {
    data: {
      data: Role[];
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
  };
  permissions?: Permission[];
  permissionGroups?: PermissionGroup[];
  filters: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
  old?: any;
  errors?: any;
}

export type { Role, Permission, PermissionGroup };

