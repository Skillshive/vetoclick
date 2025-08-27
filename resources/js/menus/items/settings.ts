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
                path:"",
                type: 'item' as const,
                // permission: 'view-breeds',
            }
        ]
    },
];

export default AnimalsMenu;
