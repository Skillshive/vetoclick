import { MenuItem } from '../index';

export const UserMangementMenu: MenuItem[] = [
    {
        id: 'dashboard',
        title: 'Tableau de bord',
        icon: 'dashboards',
        path: route('dashboard'),
        type: 'item' as const,
        permission: 'view-dashboard',
    },
    {
        id: 'users',
        title: 'Gestion des Utilisateurs',
        icon: 'users',
        type: 'group' as const,
        permissions: ['view-users', 'view-roles'],
        submenu: [
            {
                id: 'allUsers',
                title: 'Administration des Utilisateurs',
                path: route('users.index'),
                type: 'item' as const,
                permission: 'view-users',
            },
            {
                id: 'allRoles',
                title: 'Gestion des Rôles',
                path: route('roles.index'),
                type: 'item' as const,
                permission: 'view-roles',
            }
        ]
    },
];

export default UserMangementMenu;
