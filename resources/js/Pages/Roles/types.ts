import { PaginationMeta, PaginationLinks } from '../../types/Pagination';
import { Filters } from '../../types/Filters';

// Role interface
export interface Role {
    uuid: string;
    name: string;
    guard_name: string;
    description?: string;
    permissions?: Permission[];
    permissions_count?: number;
    created_at: string;
    updated_at: string;
}

// Permission interface
export interface Permission {
    uuid: string;
    name: string;
    group?: {
        uuid: string;
        name: string;
    };
    group_name?: string;
    created_at: string;
    updated_at: string;
}

// Permission Group interface
export interface PermissionGroup {
    id: number;
    uuid: string;
    name: string;
}

// Role filters interface
export interface RoleFilters {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
    page?: number;
}

// Paginated roles response
export interface PaginatedRoles {
    data: {
        data: Role[];
        meta: PaginationMeta;
        links: PaginationLinks;
    };
}

// Role management page props
export interface RoleManagementPageProps {
    roles: PaginatedRoles;
    filters: RoleFilters;
    permissions?: Permission[];
    permissionGroups?: PermissionGroup[];
}

// Role form data
export interface RoleFormData {
    name: string;
    guard_name: string;
    description?: string;
    permissions: string[];
}
