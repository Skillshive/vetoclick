import { MenuItem } from '../index';

const AnimalsMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'common.dashboard',
    icon: 'dashboards',
    path: route('dashboard'),
    type: 'item' as const,
  },
  {
    id: 'animals',
    title: 'common.menu.animals_management',
    icon: 'animals',
    type: 'group' as const,
    submenu: [
      {
        id: 'allAnimals',
        title: 'common.menu.breed_administration',
        path: route('species.index'),
        type: 'item' as const,
      },
    ],
  },
  {
    id: 'suppliers',
    title: 'common.menu.suppliers_management',
    icon: 'suppliers',
    type: 'group' as const,
    submenu: [
      {
        id: 'allSuppliers',
        title: 'common.menu.suppliers_list',
        path: route('suppliers.index'),
        type: 'item' as const,
      },
    ],
  },
];

export { AnimalsMenu };