import { MenuItem } from './index';
import UserMangementMenu from './domins/user-mangement';

const mainMenus: MenuItem[] = [
    ...UserMangementMenu,

];

export const composeMenuForRole = (role?: string): MenuItem[] => {
    // if (!role) {
    //     console.log('No role specified, returning  mainMenus');
    //     return mainMenus;
    // }
    return mainMenus;
    // switch (role) {
    //     case "super-admin": return UserMangementMenu;
    //     case '*': return mainMenus;  //console.log(`Role not recognized: ${role}, returning mainMenus`);
    // }
};

export default composeMenuForRole;
