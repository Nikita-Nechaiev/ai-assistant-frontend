import React from 'react';
import LogoutButton from '../common/LogoutButton';
import NavigationList from './NavigationList';
import AppLogo from '../common/AppLogo';

const Sidebar = () => {
  return (
    <aside className='w-64 p-2 bg-gray-900 text-mainLight flex flex-col fixed h-full'>
      <AppLogo />
      <div className='mt-3'>
        <NavigationList />
      </div>
      <div className='mt-auto'></div>
      <LogoutButton />
    </aside>
  );
};

export default Sidebar;
