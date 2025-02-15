'use client';

import React from 'react';
import { IoMdClose } from 'react-icons/io';
import Drawer from '@/ui/Drawer';
import { IInvitation } from '@/models/models';
import NotificationItem from './NotificationItem';

interface NotificationsDrawerProps {
  isOpen: boolean;
  handleClose: () => void;
  invitations: IInvitation[];
  onAccept: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationsDrawer = ({
  isOpen,
  handleClose,
  invitations,
  onAccept,
  onMarkAsRead,
  onDelete,
}: NotificationsDrawerProps) => {
  return (
    <Drawer
      initialWidth={50}
      minWidth={25}
      maxWidth={70}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className='flex flex-col h-full'>
        <div className='sticky top-0 z-10 p-4 border-b border-gray-200 flex justify-between items-center bg-white'>
          <button
            onClick={handleClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <IoMdClose size={30} />
          </button>
          <h2 className='text-xl font-semibold'>Notifications</h2>
        </div>

        <div className='overflow-y-auto p-4 flex-1'>
          {invitations.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            <ul className='space-y-4'>
              {invitations.map((invitation) => (
                <NotificationItem
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={onAccept} 
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default NotificationsDrawer;
