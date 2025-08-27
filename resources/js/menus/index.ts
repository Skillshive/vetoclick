// import { adminMenu } from '../../../.apiwi/admin';
// import { superAdminMenu } fro../../../.apiwi/super-adminmin';
// import { doctorMenu } from '../../../.apiwi/doctor';
// import { nurseMenu } fro../../../.apiwi/nurserse';
// import { receptionistMenu } fro../../../.apiwi/receptionistist';
import composeMenuForRole from './main';

export interface MenuItem {
    id: string;
    title: string;
    icon?: string; // Changed from React component to string
    path?: string;
    type: 'item' | 'group' | 'collapse'; // Added 'collapse' for nested submenus
    submenu?: MenuItem[];
    childs?: MenuItem[]; // Added for collapse type items
    permission?: string; // Optional permission required to view this menu item
    permissions?: string[]; // Multiple permissions (any of them grants access)
    level?: number; // Track nesting level
}

// export interface MenuConfig {
//     [key: string]: MenuItem[];
// }

// const menuConfigs: MenuConfig = {
//     'admin': adminMenu,
//     'super-admin': superAdminMenu,
//     'doctor': doctorMenu,
//     'nurse': nurseMenu,
//     'receptionist': receptionistMenu,
//     'guest': []
// };

export const getMenuByRole = (role: string): MenuItem[] => {
    /* !menuConfigs[role] ||  */
    if (role === 'guest') {
        console.log('Role not found or is guest, returning guest menu as fallback');
        return [];
    }
    return composeMenuForRole(role);
};

export const getAllMenus = () => {
    return composeMenuForRole();
};

// Export individual menus for direct access
//export { adminMenu, superAdminMenu, doctorMenu, nurseMenu, receptionistMenu };
