import {MenuItem} from '../index';

const patientManagementMenu: MenuItem[] = [
    {
        id: 'patientManagement',
        title: 'Patient Management',
        icon: 'Folder',
        type: 'group' as const,
        permissions: ['view-patient'], // Add other relevant permissions if needed
        submenu: [
            {
                id: 'patientList',
                title: 'Patient List',
                path: route('patients.index'),
                type: 'item' as const,
                permission: 'view-patient',
            },
        ]

    }
]

export default patientManagementMenu;

