import composeMenuForRole from './main';
import { ElementType } from 'react';

export interface MenuItem {
    id: string;
    title: string;
    icon?: ElementType; // Changed to accept React components directly
    path?: string;
    type: 'item' | 'group' | 'collapse' | 'root'; // Added 'root' and 'collapse' for nested submenus
    submenu?: MenuItem[];
    childs?: MenuItem[]; // Added for collapse type items
    permission?: string; // Optional permission required to view this menu item
    permissions?: string[]; // Multiple permissions (any of them grants access)
    roles?: string[]; // Optional roles that can access this menu item
    level?: number; // Track nesting level
}

// Helper interface for array-based menu configuration
export interface MenuConfig {
    id: string;
    title: string;
    icon?: ElementType;
    path?: string;
    type?: 'item' | 'group' | 'collapse' | 'root';
    children?: MenuConfig[]; // Array of child menu items for dropdowns
    permission?: string;
    permissions?: string[];
    roles?: string[]; // Optional roles that can access this menu item
}

// Re-export helper function
export { createMenuFromConfig } from './helpers';
export { translateMenuItems } from './main';

export const getMenuByRole = (role?: string): MenuItem[] => {
    // if (role === 'guest') {
    //     return [];
    // }
    return composeMenuForRole(role);
};

export const getAllMenus = () => {
    return composeMenuForRole();
};