'use client';
import React, { useState, useCallback } from 'react';

import { IoMdNotifications } from 'react-icons/io';
import { FiSettings } from 'react-icons/fi';

import { useUserStore } from '@/store/useUserStore';
import { IInvitation } from '@/models/models';

import UserAvatarCircle from '../common/UserAvatarCircle';
import ProfileModal from './ProfileModal';

interface HeaderProps {
  handleToggleDrawwer: () => void;
  invitations: IInvitation[];
}

const Header: React.FC<HeaderProps> = ({ handleToggleDrawwer, invitations }) => {
  const { user } = useUserStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const unreadCount = invitations?.filter((inv) => inv.notificationStatus === 'unread').length || 0;

  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  return (
    <>
      <header className='flex z-50 items-center justify-between px-6 py-4 bg-mainDark text-mainLight shadow-md fixed w-[calc(100%-16rem)] left-64'>
        <div className='flex items-center space-x-4'>
          <UserAvatarCircle avatar={user?.avatar} />
          <div className='text-left'>
            <p className='text-sm font-semibold'>{user?.name}</p>
            <p className='text-xs text-mainLightGray'>{user?.email}</p>
          </div>
        </div>

        <div className='flex items-center space-x-4 relative'>
          <button
            aria-label='Настройки профиля'
            onClick={openProfileModal}
            className='h-10 w-10 hover:bg-gray-700 rounded-full flex items-center justify-center'
          >
            <FiSettings size={24} />
          </button>

          <button
            onClick={handleToggleDrawwer}
            className='h-10 w-10 hover:bg-gray-700 rounded-full flex items-center justify-center relative'
          >
            <IoMdNotifications size={30} />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
    </>
  );
};

export default Header;
