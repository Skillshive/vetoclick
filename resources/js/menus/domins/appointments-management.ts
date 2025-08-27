
import { MenuItem } from '../index';
export const AppointmentsMenu: MenuItem[] = [
    {
        id: 'appointments',
        title: 'Gestion des rendez-vous',
        icon: 'calendar',
        type: 'item' as const,
        permission: 'permissions-hack', //manage-appointments
    },

    // {
    //     id: 'consultations',
    //     title: 'Consultations',
    //     icon: 'dashboards',
    //     type: 'group' as const,
    //     permission: 'view-consultations',
    //     submenu: [
    //         {
    //             id: 'consultationAll',
    //             title: 'All Consultations',
    //             path: '/consultations',
    //             type: 'item' as const,
    //             permission: 'view-consultations',
    //         },
    //         {
    //             id: 'consultationList',
    //             title: 'Liste des consultations',
    //             path: '/consultations',
    //             type: 'item' as const,
    //             permission: 'view-consultation',
    //         }
    //     ]
    // }
];

export default AppointmentsMenu;
