import { MenuItem } from './index';
import { AnimalsMenu } from './items/settings';

function translateMenuItem(item: MenuItem, t: (key: string) => string): MenuItem {
  const translatedItem = {
    ...item,
    title: t(item.title),
  };

  if (item.submenu) {
    translatedItem.submenu = item.submenu.map(subItem => translateMenuItem(subItem, t));
  }

  if (item.childs) {
    translatedItem.childs = item.childs.map(child => translateMenuItem(child, t));
  }

  return translatedItem;
}

export const composeMenuForRole = (role?: string): MenuItem[] => {
  // Return untranslated menu items - translation will be applied in components
  return AnimalsMenu;
};

export const translateMenuItems = (menuItems: MenuItem[], t: (key: string) => string): MenuItem[] => {
  return menuItems.map(item => translateMenuItem(item, t));
};

export default composeMenuForRole;
