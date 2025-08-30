import { MenuItem } from '../index';

export const AnimalsMenu: MenuItem[] = [
    {
        id: 'dashboard',
        title: 'Tableau de bord',
        icon: 'dashboards',
        path: route('dashboard'),
        type: 'item' as const,
        // permission: 'view-dashboard',
    },
    {
        id: 'animals',
        title: 'Gestion des animaux',
        icon: 'animals',
        type: 'group' as const,
        // permissions: ['view-breeds'],
        submenu: [
            {
                id: 'allAnimals',
                title: 'Administration des races',
                path:route('species.index'),
                type: 'item' as const,
                // permission: 'view-breeds',
            }
        ]
    },
    {
        id: 'suppliers',
        title: 'Gestion des fournisseurs',
        icon: 'suppliers',
        type: 'group' as const,
        // permissions: ['view-suppliers'],
        submenu: [
            {
                id: 'allSuppliers',
                title: 'Liste des fournisseurs',
                path: route('suppliers.index'),
                type: 'item' as const,
                // permission: 'view-suppliers',
            }
        ]
    },
];

export default AnimalsMenu;
