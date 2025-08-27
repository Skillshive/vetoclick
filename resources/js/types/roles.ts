import { PaginationMeta, PaginationLinks } from './Pagination';
import { Filters } from './Filters';
// Role interface
export interface Role {
    id: number;
    uuid: string;
    name: string;
    guard_name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    permissions?: any[];
}

// Role filters interface
export interface RoleFilters {
    search?: string;
    page?: number;
}


// Paginated roles response
export interface PaginatedRoles {
    data: Role[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface PermissionData{
    id: string;
    name: string;
}
export interface Permission {
    data: PermissionData[];
}

export interface UserRoles{
    id: string;
    name:string;
    created_at?: string;
}

export interface RoleManagementPageProps {
    roles: PaginatedRoles;
    permissions: Permission;
    filters: Filters;
}


