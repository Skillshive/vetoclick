import { MenuItem } from './index';
/* Lists Routing */
import AppointmentsMenu from './domins/appointments-management';
import UserMangementMenu from './domins/user-mangement';
import HrMangementMenu from './domins/hr-management';
import patientManagementMenu from './domins/patient-management';
//import StockMenu from './domins/stock';


const mainMenus: MenuItem[] = [
    ...UserMangementMenu,
    ...AppointmentsMenu,
    ...HrMangementMenu,
    ...patientManagementMenu,
    //...StockMenu,
    // ...adminMenu, //Uncomment if admin menu is needed

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


//export default mainMenus;

export default composeMenuForRole;
