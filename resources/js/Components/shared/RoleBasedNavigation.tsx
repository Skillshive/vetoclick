import React from 'react';
import { Link } from '@inertiajs/react';
import { useRoleBasedMenu } from '@/hooks/useRoleBasedMenu';
import { MenuItem } from '@/menus';

interface RoleBasedNavigationProps {
  className?: string;
}

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ className }) => {
  const { menuItems, hasRole } = useRoleBasedMenu();

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === 'item' && item.path) {
      return (
        <Link
          key={item.id}
          href={item.path}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
        >
          {item.icon && item.icon({ className: 'mr-3 h-5 w-5' })}
          {item.title}
        </Link>
      );
    }

    if (item.type === 'group' && item.submenu) {
      return (
        <div key={item.id} className="space-y-1">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {item.title}
          </div>
          {item.submenu.map((subItem) => (
            <Link
              key={subItem.id}
              href={subItem.path || '#'}
              className="flex items-center px-8 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
            >
              {subItem.title}
            </Link>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <nav className={className}>
      <div className="space-y-1">
        {menuItems.map(renderMenuItem)}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation; 