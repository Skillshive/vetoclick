import { MenuItem } from './index';
import { AnimalsMenu } from './items/settings';
import { useTranslation } from '@/hooks/useTranslation';

function translateMenuItem(item: MenuItem, t: (key: string) => string): MenuItem {
  const translatedItem = {
    ...item,
    title: t(item.title),
  };

  if (item.submenu) {
    translatedItem.submenu = item.submenu.map(subItem => translateMenuItem(subItem, t));
  }

  return translatedItem;
}

export const composeMenuForRole = (role?: string): MenuItem[] => {
  const { t } = useTranslation();
  return AnimalsMenu.map(item => translateMenuItem(item, t));
};

export default composeMenuForRole;
