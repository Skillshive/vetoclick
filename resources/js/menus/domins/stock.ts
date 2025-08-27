
import { MenuItem } from '../index';

export const StockMenu: MenuItem[] = [


    {
        id: 'product',
        title: 'Gestion de Stock',
        icon: 'dashboards.home',
        type: 'group' as const,
        permission: 'view-product',
        submenu: [
            // {
            //     id: 'scheduleProduct',
            //     title: 'Crier un Produit',
            //     path: route('products.create'),
            //     type: 'item' as const,
            //     permission: 'create-product',
            // },
            // {
            //     id: 'productList',
            //     title: 'Liste des produits',
            //     path: route('products.index'),
            //     type: 'item' as const,
            //     permission: 'view-product',
            // }
        ]
    },

    {
        id: 'categorie',
        title: 'Ajouter une categorie',
        icon: 'dashboards',
        path: route('categories.index'),
        type: 'item' as const,
        permissions: ['create-categories', 'view-categories'],
    },
    // {
    //     id: 'famille',
    //     title: 'Ajouter une famille',
    //     icon: 'dashboards',
    //     path: route('famille'),
    //     type: 'item' as const,
    //     permissions: ['create-famille', 'view-famille'],
    // },
    {
        id: 'fournisseur',
        title: 'Ajouter un fournisseur',
        icon: 'dashboards',
        path: route('suppliers.index'),
        type: 'item' as const,
        permissions: ['create-supplires', 'view-suppliers'],
    },
];

export default StockMenu;
