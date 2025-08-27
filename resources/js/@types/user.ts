// export interface Role {
//     id: number;
//     name: string;
//     guard_name: string;
//     permissions: Permission[];
// }
export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
}
export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface User {
    id: number;
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    image?: string;
    status: boolean;
    created_at: string;
    roles: [];
    permissions: [];
}
