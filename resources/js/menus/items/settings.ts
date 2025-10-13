import { MenuItem, MenuConfig } from '../index';
import { createMenuFromConfig } from '../helpers';
import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import PetIcon from "@/assets/dualicons/pet.svg?react";
import BoxIcon from "@/assets/dualicons/box.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";
import LampIcon from "@/assets/dualicons/lamp.svg?react";
import UserGroupIcon from "@/assets/nav-icons/people.svg?react";

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
    type: 'collapse', 
    children: [
      {
        id: 'allAnimals',
        title: 'common.menu.species',
        path: route('species.index'),
        type: 'item',
      },
      {
        id: 'createAnimal',
        title: 'common.menu.create_species',
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
            path: route('products.index'),
            type: 'item',
          },
          {
            id: 'productsCreate',
            title: 'common.menu.create_product',
            path: route('products.create'),
            type: 'item',
          },
          {
            id: 'productsForm',
            title: 'common.menu.create_product_form',
            path: route('products.form'),
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
    id: 'users',
    title: 'common.menu.users_management',
    icon: UserGroupIcon,
    type: 'collapse',
    children: [
      {
        id: 'usersList',
        title: 'common.menu.users_list',
        path: route('users.index'),
        type: 'item',
      },
      {
        id: 'createUser',
        title: 'common.menu.create_user',
        path: route('users.create'),
        type: 'item',
      },
    ],
  },
];

// Convert the array-based config to MenuItem format
const AnimalsMenu: MenuItem[] = createMenuFromConfig(menuConfig);

export { AnimalsMenu, menuConfig };