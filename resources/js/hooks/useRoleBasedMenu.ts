/**
 * useRoleBasedMenu Hook
 *
 * This hook manages role-based menu filtering with permission checking.
 * It filters menu items based on user permissions and roles.
 *
 * Permission System:
 * - Each menu item can have a 'permission' (single) or 'permissions' (array) property
 * - If a menu item has a permission requirement, the user must have that permission to see it
 * - For group items, if no subitems are visible after filtering, the group is hidden
 * - Permissions are checked against both direct user permissions and role-based permissions
 *
 * Usage:
 * const { menuItems, hasPermission, userRole } = useRoleBasedMenu();
 */
import { useAuthContext } from '@/contexts/auth/context';
import { useInertiaAuth } from './useInertiaAuth';
import { getMenuByRole, MenuItem } from '@/menus';
import { Role } from '@/@types/user';
import { usePage } from '@inertiajs/react';

export const useRoleBasedMenu = () => {
    const { user: authUser } = useAuthContext();
    const { user: inertiaUser, isAuthenticated } = useInertiaAuth();

    const user = inertiaUser || authUser;

    const getUserRole = (): string => {
        if (!user || !user.roles || user.roles.length === 0) {
            return 'guest';
        }

        const primaryRole = user.roles[0];
        // const roleMap: { [key: string]: string } = {
        //     'admin': 'admin',
        //     'super-admin': 'super-admin',
        //     'doctor': 'doctor',
        //     'nurse': 'nurse',
        //     'receptionist': 'receptionist',
        // };
        // const mappedRole = roleMap[primaryRole] || 'guest';
        // //console.log(`Mapped role for user ${user.id}: ${mappedRole}`);
        // return mappedRole;
        return primaryRole;
    };

    const filterMenuByPermissions = (menuItems: MenuItem[]): MenuItem[] => {        
        return menuItems.filter(item => {
            // Check if item has permission requirements
            if (item.permission && !hasPermission(item.permission)) {
                return false;
            }

            if (item.permissions && !hasAnyPermission(item.permissions)) {
                return false;
            }

            // If item is a group, filter its submenu
            if (item.type === 'group' && item.submenu) {
                const filteredSubmenu = filterMenuByPermissions(item.submenu);

                // If no submenu items are visible, hide the group
                if (filteredSubmenu.length === 0) {
                    return false;
                }

                // Update the item with filtered submenu
                item.submenu = filteredSubmenu;
            }

            return true;
        });
    };

    const getMenuItems = (): MenuItem[] => {
        const role = getUserRole();
        const menuItems = getMenuByRole(role);
        // Filter menu items based on user permissions
        const filteredMenuItems = filterMenuByPermissions([...menuItems]); // Create a copy to avoid mutating original

        return filteredMenuItems;
    };

    const getTypesGroup = (): MenuItem | undefined => {
        const items = getMenuItems();
        return items.find(item => item.id === 'types');
    };

    const hasRole = (role: string): boolean => {
        if (!user || !user.roles) return false;
        return user.roles.some((userRole: Role) => userRole.name === role);
    };

    const hasAnyRole = (roles: string[]): boolean => {
        if (!user || !user.roles) return false;
        return user.roles.some((userRole: Role) => roles.includes(userRole.name));
    };

    const hasPermission = (permission: string): boolean => {
        if (!user) return false;
        // Check if user has the permission directly
        if (user.permissions && Array.isArray(user.permissions)) {
            const hasDirectPermission = user.permissions.some((userPermission: any) =>
                userPermission === permission
            );
            if (hasDirectPermission) return true;
        }
        // Check if user has the permission through roles
        if (user.roles && Array.isArray(user.roles)) {
            return user.roles.some((role: any) => {
                if (role.permissions && Array.isArray(role.permissions)) {
                    return role.permissions.some((rolePermission: any) =>
                        rolePermission === permission
                    );
                }
                return false;
            });
        }
        return false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!permissions || permissions.length === 0) return true;
        return permissions.some(permission => hasPermission(permission));
    };

    const normalizedUser = user ? {
        ...user,
        name: user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.name || 'User',
        roles: user.roles?.map((role: any) => ({
            role,
        })) || [],
        permissions: user.permissions || []
    } : null;

    return {
        menuItems: getMenuItems(),
        userRole: getUserRole(),
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        user: normalizedUser,
        isAuthenticated,
        typesGroup: getTypesGroup(),
    };
};
