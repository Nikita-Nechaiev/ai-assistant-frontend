'use client';

import React from 'react';

import { FiBell, FiCheckCircle } from 'react-icons/fi';

import Drawer from '@/components/common/Drawer';
import PanelHeader from '@/components/common/PanelHeader';
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
}: NotificationsDrawerProps) => (
  <Drawer initialWidth={34} minWidth={28} maxWidth={65} isOpen={isOpen} handleClose={handleClose} title='Notifications'>
    <PanelHeader
      title='Notifications'
      description='Invitations and updates, all in one place.'
      icon={<FiBell size={19} aria-hidden='true' />}
      onClose={handleClose}
    />
    <div className='min-h-0 flex-1 overflow-y-auto bg-muted/50 p-5'>
      {!invitations.length ? (
        <div className='flex h-full min-h-[200px] flex-col items-center justify-center px-6 text-center'>
          <span className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white text-primary'>
            <FiCheckCircle size={24} strokeWidth={1.5} aria-hidden='true' />
          </span>
          <h3 className='text-base font-semibold'>You're all caught up.</h3>
          <p className='mt-2 max-w-[260px] text-sm leading-6 text-muted-foreground'>
            New session invitations will appear here when someone invites you to collaborate.
          </p>
        </div>
      ) : (
        <ul className='space-y-3'>
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
  </Drawer>
);

export default NotificationsDrawer;
