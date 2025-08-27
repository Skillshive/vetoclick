import { MenuItem } from '../index';

export const HrMangementMenu: MenuItem[] = [

    {
        id: 'hrManagement',
        title: 'Gestion des RH',
        icon: 'building',
        type: 'group' as const,
        permissions: ['view-employees', 'view-departments', 'view-document-types', 'view-leave-types', 'view-positions', 'view-cost-centers', 'view-employment-types'],
        submenu: [
            {
                id: 'employeeList',
                title: 'Liste des employés',
                path: route('employees.index'),
                type: 'item' as const,
                permission: 'view-employees',
            },
            {
                id: 'departmentList',
                title: 'Liste des départements',
                path: route('departements'),
                type: 'item' as const,
                permission: 'view-departments',
            },
            {
                id: "positionManagement",
                title: 'Gestion des postes',
                path: route('positions'),
                type: 'item' as const,
                permission: 'view-positions',
            },
            {
                id: "costCenterManagement",
                title: 'Centre de coûts',
                path: route('costcenters'),
                type: 'item' as const,
                permission: 'view-cost-centers',
            },
            {
                id: 'documentManagement',
                title: 'Gestion des documents',
                path: route('documents.index'),
                type: 'item' as const,
                permission: 'view-documents',
            },
            {
                id:"promotionManagement",
                title: ' Gestion des promotions',
                path: route('promotions.index'),
                type: 'item' as const,
                // permission: 'view-promotions',
            },
            {
                id: 'typesSubmenu',
                title: 'Types',
                icon: 'collection',
                type: 'collapse' as const,
                permissions: ['view-employment-types', 'view-document-types', 'view-leave-types'],
                childs: [
                    {
                        id: 'documentTypeList',
                        title: 'Types de documents',
                        path: route('document_types'),
                        type: 'item' as const,
                        permission: 'view-document-types',
                    },
                    {
                        id: 'leaveTypeManagement',
                        title: 'Types de congés',
                        path: route('leave_types'),
                        type: 'item' as const,
                        permission: 'view-leave-types',
                    },
                    {
                        id: "employmentTypeManagement",
                        title: 'Types de contrats',
                        path: route('employment_types'),
                        type: 'item' as const,
                        permission: 'view-employment-types',
                    },
                ]
            }
        ]
    },

];

export default HrMangementMenu;
