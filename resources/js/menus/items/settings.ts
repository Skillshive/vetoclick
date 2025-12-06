import { MenuItem, MenuConfig } from '../index';
import { createMenuFromConfig } from '../helpers';
import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import PetIcon from "@/assets/dualicons/pet.svg?react";
import AppointmentIcon from "@/assets/dualicons/calendar.svg?react";
import UserGroupIcon from "@/assets/dualicons/users.svg?react";
import BoxIcon from "@/assets/dualicons/box.svg?react";
import LampIcon from "@/assets/dualicons/lamp.svg?react";

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
    type: 'group', 
    children: [
      {
        path: route('appointments.index'),
        id: 'allAppointments',
        title: 'common.menu.appointments',
        type: 'item',
      }
    ],
  },
  {
    id: 'animals',
    title: 'common.menu.animals_management',
    icon: PetIcon,
    type: 'group', 
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
        id: 'orders',
        title: 'common.menu.orders',
        type: 'collapse', 
        children: [
          {
            id: 'ordersIndex',
            title: 'common.menu.orders_list',
            path: route('orders.index'),
            type: 'item',
          },
          {
            id: 'ordersCreate',
            title: 'common.menu.create_order',
            path: route('orders.create'),
            type: 'item',
          },
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
        path: route('category-products.index'),
        type: 'item',
      },
      {
        id: 'suppliers',
        title: 'common.menu.suppliers',
        path: route('suppliers.index'),
        type: 'item',
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
    type: 'group',
    children: [
      {
        id: 'usersList',
        title: 'common.menu.users_list',
        path: route('users.index'),
        type: 'item',
      },
      {
        id: 'clientsList',
        title: 'common.menu.clients_list',
        path: route('clients.index'),
        type: 'item',
      },
    ],
  },
];

const AnimalsMenu: MenuItem[] = createMenuFromConfig(menuConfig);

export { AnimalsMenu, menuConfig };