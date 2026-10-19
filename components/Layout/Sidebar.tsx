import React from 'react';

import LogoutButton from '../common/LogoutButton';
import NavigationList from './NavigationList';
import AppLogo from '../common/AppLogo';

const Sidebar = () => (
  <aside className='fixed inset-y-0 left-0 z-30 flex w-[232px] flex-col border-r border-border bg-white px-5 py-7'>
    <div className='px-2'>
      <AppLogo variant='workspace' />
    </div>
    <div className='mt-12'>
      <p className='mb-3 px-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-muted-foreground'>Workspace</p>
      <NavigationList />
    </div>
    <div className='mt-auto pt-10'>
      <LogoutButton workspace />
    </div>
  </aside>
);

export default Sidebar;
