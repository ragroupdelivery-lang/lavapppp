
import React from 'react';
import { useLocation } from 'react-router-dom';
import { BellIcon, UserCircleIcon } from '../icons/Icons';

const getTitleFromPathname = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  const title = pathname.replace('/', '').replace(/-/g, ' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = getTitleFromPathname(location.pathname);

  return (
    <header className="flex items-center justify-between h-20 px-6 md:px-8 bg-white border-b border-brand-gray-200">
      <h1 className="text-2xl font-semibold text-brand-gray-800">{title}</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-brand-gray-500 hover:bg-brand-gray-100 hover:text-brand-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
          <BellIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
           <UserCircleIcon className="h-9 w-9 text-brand-gray-400" />
           <div>
            <p className="font-medium text-sm text-brand-gray-700">Admin User</p>
            <p className="text-xs text-brand-gray-500">Laundry Manager</p>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
