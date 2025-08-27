import { MenuItem } from './index';
import  { AnimalsMenu } from './items/settings';

const mainMenus: MenuItem[] = [
    ...AnimalsMenu,
];

export const composeMenuForRole = (role?: string): MenuItem[] => {
    return mainMenus;
};

export default composeMenuForRole;
