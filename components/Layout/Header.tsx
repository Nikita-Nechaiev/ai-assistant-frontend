'use client';

import React, { useState, useCallback } from 'react';

import { FiBell, FiSettings } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';
import { IInvitation } from '@/models/models';
import { NotificationStatusEnum } from '@/models/enums';
import WorkspaceBreadcrumbs, { WorkspaceBreadcrumbItem } from '@/components/common/WorkspaceBreadcrumbs';

import UserAvatarCircle from '../common/UserAvatarCircle';
import ProfileModal from './ProfileModal';

interface HeaderProps {
  handleToggleDrawwer: () => void;
  invitations: IInvitation[];
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ handleToggleDrawwer, invitations, title = 'Workspace' }) => {
  const pathname = usePathname();
  const { user } = useUserStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const unreadCount =
    invitations?.filter((inv) => inv.notificationStatus === NotificationStatusEnum.UNREAD).length || 0;
  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);
  const items: WorkspaceBreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }];

  if (pathname.startsWith('/ai-assistance')) {
    items.push({ label: 'AI Assistance', href: '/ai-assistance' });

    if (pathname.startsWith('/ai-assistance/stepper')) {
      items.push({ label: 'New request', href: '/ai-assistance/stepper' });
    }
  } else if (pathname !== '/dashboard') {
    items.push({ label: pathname === '/faq' ? 'Help & resources' : title, href: pathname });
  }

  return (
    <>
      <header className='relative z-20 flex h-[72px] shrink-0 items-center justify-between gap-6 border-b border-border bg-white px-9'>
        <WorkspaceBreadcrumbs items={items} />
        <div className='flex shrink-0 items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Profile settings'
            onClick={openProfileModal}
            className='text-muted-foreground'
          >
            <FiSettings size={18} aria-hidden='true' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            data-testid='open-notifications-drawer'
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            onClick={handleToggleDrawwer}
            className='relative text-muted-foreground'
          >
            <FiBell size={18} aria-hidden='true' />
            {unreadCount > 0 && (
              <span className='absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[13px] font-semibold text-white'>
                {unreadCount}
              </span>
            )}
          </Button>
          <div className='ml-4 flex items-center gap-3 border-l border-border pl-5'>
            <div className='[&_img]:h-9 [&_img]:w-9 [&_img]:border-border [&_img]:shadow-none'>
              <UserAvatarCircle avatar={user?.avatar} name={user?.name} />
            </div>
            <div className='max-w-[185px]'>
              <p className='truncate text-sm font-semibold'>{user?.name}</p>
              <p className='mt-1 truncate text-sm text-muted-foreground'>{user?.email}</p>
            </div>
          </div>
        </div>
      </header>
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
};

export default Header;
