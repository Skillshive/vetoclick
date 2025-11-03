import { MenuItem, MenuConfig } from '../index';
import { createMenuFromConfig } from '../helpers';
import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import PetIcon from "@/assets/dualicons/pet.svg?react";
import AppointmentIcon from "@/assets/dualicons/calendar.svg?react";
import BoxIcon from "@/assets/dualicons/box.svg?react";
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
    id: 'appointments',
    title: 'common.menu.appointments_management',
    icon: AppointmentIcon,
    type: 'collapse', 
    children: [
      {
        id: 'allAppointments',
        title: 'common.menu.appointments',
        path: route('appointments.index'),
        type: 'item',
      }
    ],
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
      }
    ],
  },
  {
    id: 'stock',
    title: 'common.menu.stock_management',
    icon: BoxIcon,
    type: 'group',
    children: [
      {
        id: 'suppliers',
        title: 'common.menu.suppliers',
        type: 'collapse', 
        children: [
          {
            id: 'suppliersIndex',
            title: 'common.menu.suppliers_list',
            path: route('suppliers.index'),
            type: 'item',
          }
        ],
      },
      {
        id: 'products',
        title: 'common.menu.products',
        type: 'collapse', 
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
          }
        ],
      },
      {
        id: 'categories',
        title: 'common.menu.categories',
        type: 'collapse', 
        children: [
          {
            id: 'categoriesIndex',
            title: 'common.menu.categories_list',
            path: route('category-products.index'),
            type: 'item',
          },
        ],
      },
    ],
  },
  {
    id: 'Blogs',
    title: 'common.menu.blogs_management',
    icon: LampIcon,
    type: 'collapse', 
    children: [
      {
        id: 'allBlogs',
        title: 'common.menu.blogs_list',
        path: route('blogs.index'),
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
      }
    ],
  },
];

const AnimalsMenu: MenuItem[] = createMenuFromConfig(menuConfig);

export { AnimalsMenu, menuConfig };