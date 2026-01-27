import { MenuItem, MenuConfig } from '../index';
import { createMenuFromConfig } from '../helpers';
import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import PetIcon from "@/assets/dualicons/pet.svg?react";
import AppointmentIcon from "@/assets/dualicons/appointments.svg?react";
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
    permission: 'appointments.view',
    children: [
      {
        path: route('appointments.index'),
        id: 'allAppointments',
        title: 'common.menu.appointments',
        type: 'item',
        permission: 'appointments.view',
      },
      {
        path: route('appointments.calendar'),
        id: 'calendarAppointments',
        title: 'common.menu.calendar_appointments',
        type: 'item',
        permission: 'appointments.calendar',
      }
    ],
  },
  {
    id: 'animals',
    title: 'common.menu.animals_management',
    icon: PetIcon,
    type: 'group',
    permission: 'species.view',
    children: [
      {
        id: 'allAnimals',
        title: 'common.menu.species',
        path: route('species.index'),
        type: 'item',
        permission: 'species.view',
      }
    ],
  },
  {
    id: 'stock',
    title: 'common.menu.stock_management',
    icon: BoxIcon,
    type: 'group',
    permission: 'orders.view',
    children: [
      {
        id: 'orders',
        title: 'common.menu.orders',
        type: 'collapse',
        permission: 'orders.view',
        children: [
          {
            id: 'ordersIndex',
            title: 'common.menu.orders_list',
            path: route('orders.index'),
            type: 'item',
            permission: 'orders.view',
          },
          {
            id: 'ordersCreate',
            title: 'common.menu.create_order',
            path: route('orders.create'),
            type: 'item',
            permission: 'orders.create',
          },
        ],
      },
      {
        id: 'products',
        title: 'common.menu.products',
        type: 'collapse',
        permission: 'products.view',
        children: [
          {
            id: 'productsIndex',
            title: 'common.menu.products_list',
            path: route('products.index'),
            type: 'item',
            permission: 'products.view',
          },
          {
            id: 'productsCreate',
            title: 'common.menu.create_product',
            path: route('products.create'),
            type: 'item',
            permission: 'products.create',
          }
        ],
      },
      {
        id: 'categories',
        title: 'common.menu.categories',
        path: route('category-products.index'),
        type: 'item',
        permission: 'category-products.view',
      },
      {
        id: 'suppliers',
        title: 'common.menu.suppliers',
        path: route('suppliers.index'),
        type: 'item',
        permission: 'suppliers.view',
      },
    ],
  },
  {
    id: 'Blogs',
    title: 'common.menu.blogs_management',
    icon: LampIcon,
    type: 'collapse',
    permission: 'blogs.view',
    children: [
      {
        id: 'allBlogs',
        title: 'common.menu.blogs_list',
        path: route('blogs.index'),
        type: 'item',
        permission: 'blogs.view',
      },
      {
        id: 'categoryBlogs',
        title: 'common.menu.categories_list',
        path: route('category-blogs.index'),
        type: 'item',
        permission: 'category-blogs.view',
      },
    ],
  },
  {
    id: 'users',
    title: 'common.menu.users_management',
    icon: UserGroupIcon,
    type: 'group',
    permission: 'users.view',
    children: [
      {
        id: 'usersList',
        title: 'common.menu.users_list',
        path: route('users.index'),
        type: 'item',
        permission: 'users.view',
      },
      {
        id: 'clientsList',
        title: 'common.menu.clients_list',
        path: route('clients.index'),
        type: 'item',
        permission: 'clients.view',
      },
    ],
  },
];

const AnimalsMenu: MenuItem[] = createMenuFromConfig(menuConfig);

export { AnimalsMenu, menuConfig };