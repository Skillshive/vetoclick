import { MenuItem, MenuConfig } from './index';

// Helper function to convert MenuConfig array to MenuItem format
export const createMenuFromConfig = (config: MenuConfig[]): MenuItem[] => {
    return config.map(item => {
        const menuItem: MenuItem = {
            id: item.id,
            title: item.title,
            icon: item.icon,
            path: item.path,
            type: item.type || 'item',
            permission: item.permission,
            permissions: item.permissions,
        };

        // Handle children for dropdowns
        if (item.children && item.children.length > 0) {
            if (item.type === 'collapse' || item.type === 'root') {
                menuItem.childs = createMenuFromConfig(item.children);
            } else {
                menuItem.submenu = createMenuFromConfig(item.children);
            }
        }

        return menuItem;
    });
};
