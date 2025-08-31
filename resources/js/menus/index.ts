import composeMenuForRole from './main';
import { ElementType } from 'react';

export interface MenuItem {
    id: string;
    title: string;
    icon?: ElementType; // Changed to accept React components directly
    path?: string;
    type: 'item' | 'group' | 'collapse'; // Added 'collapse' for nested submenus
    submenu?: MenuItem[];
    childs?: MenuItem[]; // Added for collapse type items
    permission?: string; // Optional permission required to view this menu item
    permissions?: string[]; // Multiple permissions (any of them grants access)
    level?: number; // Track nesting level
}

export const getMenuByRole = (role?: string): MenuItem[] => {
    // if (role === 'guest') {
    //     return [];
    // }
    return composeMenuForRole(role);
};

export const getAllMenus = () => {
    return composeMenuForRole();
};