import { MenuItem } from '../index';
import { DogIcon, PawPrint,  PawPrintIcon,  PenLine } from "lucide-react";
import { TruckIcon, UserIcon, ShieldCheckIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import PetIcon from "@/assets/dualicons/pet.svg?react";
import BoxIcon from "@/assets/dualicons/box.svg?react";
import BoxAddIcon from "@/assets/nav-icons/box-add.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";
import LampIcon from "@/assets/dualicons/lamp.svg?react";

const AnimalsMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'common.dashboard',
    icon: DashboardsIcon,
    path: route('dashboard'),
    type: 'item' as const,
  },
  {
    id: 'animals',
    title: 'common.menu.animals_management',
    icon: PetIcon,
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
    icon: BoxIcon,
    type: 'group' as const,
    submenu: [
      {
        id: 'allSuppliers',
        title: 'common.menu.suppliers_list',
        path: route('suppliers.index'),
        type: 'item' as const,
      },
      {
        id: 'allProducts',
        title: 'common.menu.products_list',
        path: '',
        type: 'item' as const,
      },
      {
        id: 'categoryProducts',
        title: 'common.menu.categories_list',
        path: route('category-products.index'),
        type: 'item' as const,
      },
    ],
  },

  {
    id: 'Blogs',
    title: 'common.menu.blogs_management',
    icon: LampIcon,
    type: 'group' as const,
    submenu: [
      {
        id: 'allBlogs',
        title: 'common.menu.blogs_list',
        path: '',
        type: 'item' as const,
      },
      {
        id: 'categoryBlogs',
        title: 'common.menu.categories_list',
        path: route('category-blogs.index'),
        type: 'item' as const,
      },
    ],
  },
  {
    id: 'settings',
    title: 'common.menu.settings',
    icon: SettingIcon,
    type: 'group' as const,
    submenu: [
      {
        id: 'allUsers',
        title: 'common.menu.users_list',
        path: route('users.index'),
        type: 'item' as const,
      },
      {
        id: 'roleManagement',
        title: 'common.menu.roles_permissions',
        path: route('roles.index'),
        type: 'item' as const,
      },  {
        id: 'allSubscriptionPlans',
        title: 'common.menu.subscription_plans_list',
        path: route('subscription-plans.index'),
        type: 'item' as const,
      },
    ],
  },
];

export { AnimalsMenu };