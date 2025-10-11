import { MenuItem, MenuConfig } from '../index';
import { createMenuFromConfig } from '../helpers';
import { DogIcon, PawPrint,  PawPrintIcon,  PenLine } from "lucide-react";
import { TruckIcon, UserIcon, ShieldCheckIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import PetIcon from "@/assets/dualicons/pet.svg?react";
import BoxIcon from "@/assets/dualicons/box.svg?react";
import BoxAddIcon from "@/assets/nav-icons/box-add.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";
import LampIcon from "@/assets/dualicons/lamp.svg?react";

// Array-based menu configuration for easy dropdown creation
const menuConfig: MenuConfig[] = [
  {
    id: 'dashboard',
    title: 'common.dashboard',
    icon: DashboardsIcon,
    path: route('dashboard'),
    type: 'item',
  },
  {
    id: 'animals',
    title: 'common.menu.animals_management',
    icon: PetIcon,
    type: 'collapse', // Changed to collapse for dropdown behavior
    children: [
      {
        id: 'allAnimals',
        title: 'common.menu.breed_administration',
        path: route('species.index'),
        type: 'item',
      },
      {
        id: 'createAnimal',
        title: 'common.menu.create_animal',
        path: route('species.create'),
        type: 'item',
      }
    ],
  },
  {
    id: 'stock',
    title: 'common.menu.stock_management',
    icon: BoxIcon,
    type: 'group', // Group to show items directly
    children: [
      {
        id: 'suppliers',
        title: 'common.menu.suppliers',
        type: 'collapse', // Collapse for dropdown behavior
        children: [
          {
            id: 'suppliersIndex',
            title: 'common.menu.suppliers_list',
            path: route('suppliers.index'),
            type: 'item',
          },
          {
            id: 'suppliersCreate',
            title: 'common.menu.create_supplier',
            path: route('suppliers.create'),
            type: 'item',
          }
        ],
      },
      {
        id: 'products',
        title: 'common.menu.products',
        type: 'collapse', // Collapse for dropdown behavior
        children: [
          {
            id: 'productsIndex',
            title: 'common.menu.products_list',
            path: '',
            type: 'item',
          },
          {
            id: 'productsCreate',
            title: 'common.menu.create_product',
            path: '',
            type: 'item',
          }
        ],
      },
      {
        id: 'categories',
        title: 'common.menu.categories',
        type: 'collapse', // Collapse for dropdown behavior
        children: [
          {
            id: 'categoriesIndex',
            title: 'common.menu.categories_list',
            path: route('category-products.index'),
            type: 'item',
          },
          {
            id: 'categoriesCreate',
            title: 'common.menu.create_category',
            path: '',
            type: 'item',
          }
        ],
      },
    ],
  },
  {
    id: 'Blogs',
    title: 'common.menu.blogs_management',
    icon: LampIcon,
    type: 'collapse', // Changed to collapse for dropdown behavior
    children: [
      {
        id: 'allBlogs',
        title: 'common.menu.blogs_list',
        path: '',
        type: 'item',
      },
      {
        id: 'categoryBlogs',
        title: 'common.menu.categories_list',
        path: route('category-blogs.index'),
        type: 'item',
      },
    ],
  },
  {
    id: 'settings',
    title: 'common.menu.settings',
    icon: SettingIcon,
    type: 'group',
    children: [
      {
        id: 'allUsers',
        title: 'common.menu.users_list',
        path: route('users.index'),
        type: 'item',
      },
      {
        id: 'roleManagement',
        title: 'common.menu.roles_permissions',
        path: route('roles.index'),
        type: 'item',
      },
      {
        id: 'allSubscriptionPlans',
        title: 'common.menu.subscription_plans_list',
        path: route('subscription-plans.index'),
        type: 'item',
      },
    ],
  },
];

// Convert the array-based config to MenuItem format
const AnimalsMenu: MenuItem[] = createMenuFromConfig(menuConfig);

export { AnimalsMenu, menuConfig };