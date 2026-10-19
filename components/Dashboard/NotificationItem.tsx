'use client';

import React from 'react';

import { FiTrash2, FiUserPlus, FiArrowRight } from 'react-icons/fi';

import { IInvitation } from '@/models/models';
import { NotificationStatusEnum, InvitationStatusEnum, PermissionEnum } from '@/models/enums';
import { getReceivedMessage, getExpirationMessage, isInvitationExpired } from '@/helpers/notificationHelpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  invitation: IInvitation;
  onAccept: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ invitation, onAccept, onMarkAsRead, onDelete }) => {
  const isRead = invitation.notificationStatus === NotificationStatusEnum.READ;
  const isExpired = isInvitationExpired(invitation.expiresAt);
  const isAccepted = invitation.invitationStatus === InvitationStatusEnum.ACCEPTED;
  const receivedMessage = getReceivedMessage(invitation.date);
  const expiresMessage = getExpirationMessage(invitation.expiresAt);

  return (
    <li className={cn('rounded-xl border bg-white p-5 shadow-card', isRead ? 'border-border' : 'border-blue-200')}>
      <div className='mb-4 flex items-center justify-between'>
        <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary'>
          <FiUserPlus size={17} aria-hidden='true' />
        </span>
        <div className='flex items-center gap-2'>
          {!isRead && <span className='h-1.5 w-1.5 rounded-full bg-primary' aria-label='Unread' />}
          <Button
            variant='ghost'
            size='icon'
            aria-label='Delete invitation'
            onClick={() => onDelete(invitation.id)}
            className='-mr-1 h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-destructive'
          >
            <FiTrash2 size={14} aria-hidden='true' />
          </Button>
        </div>
      </div>
      <h3 className='text-base font-semibold'>{invitation.session?.name || 'Session invitation'}</h3>
      <p className='mt-2 break-words text-sm leading-6 text-muted-foreground'>
        <span className='font-medium text-foreground'>{invitation.inviterEmail}</span> invited you to collaborate.
      </p>
      <div className='mt-3 flex items-center gap-2'>
        <Badge variant='secondary' className='text-[13px] font-medium'>
          {invitation.role === PermissionEnum.EDIT
            ? 'Editor'
            : invitation.role === PermissionEnum.ADMIN
              ? 'Admin'
              : 'Viewer'}{' '}
          access
        </Badge>
        {isAccepted && (
          <Badge variant='outline' className='border-blue-100 text-[13px] font-medium text-primary'>
            Accepted
          </Badge>
        )}
      </div>
      <div className='mt-4 border-t border-border pt-3'>
        <p className='text-[13px] leading-5 text-muted-foreground'>{receivedMessage}</p>
        {!isAccepted && expiresMessage && (
          <p className='text-[13px] leading-5 text-muted-foreground'>{expiresMessage}</p>
        )}
      </div>
      <div className='mt-3 flex items-center justify-between gap-3'>
        {!isRead ? (
          <Button variant='link' size='sm' className='h-7 px-0 text-[13px]' onClick={() => onMarkAsRead(invitation.id)}>
            Mark as read
          </Button>
        ) : (
          <span />
        )}
        {!isAccepted && !isExpired && (
          <Button size='sm' className='text-sm' onClick={() => onAccept(invitation.id)}>
            Accept invitation
            <FiArrowRight aria-hidden='true' />
          </Button>
        )}
        {!isAccepted && isExpired && <span className='text-[13px] text-muted-foreground'>Invitation expired</span>}
      </div>
    </li>
  );
};

export default NotificationItem;
