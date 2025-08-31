import { MenuItem } from '../index';
import { PawPrint } from "lucide-react";
import { TruckIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/outline";

const AnimalsMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'common.dashboard',
    icon: HomeIcon,
    path: route('dashboard'),
    type: 'item' as const,
  },
  {
    id: 'animals',
    title: 'common.menu.animals_management',
    icon: PawPrint,
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
    icon: TruckIcon,
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