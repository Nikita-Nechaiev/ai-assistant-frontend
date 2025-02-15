'use client';

import React from 'react';
import { IInvitation } from '@/models/models';
import { NotificationStatusEnum } from '@/models/enums';
import { IoMdTrash } from 'react-icons/io';
import {
  getReceivedMessage,
  getExpirationMessage,
  isInvitationExpired,
} from '@/helpers/notificationHelpers';

interface NotificationItemProps {
  invitation: IInvitation;
  onAccept: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  invitation,
  onAccept,
  onMarkAsRead,
  onDelete,
}) => {
  const isRead = invitation.notificationStatus === NotificationStatusEnum.READ;
  const isExpired = isInvitationExpired(invitation.expiresAt);
  const receivedMessage = getReceivedMessage(invitation.date);
  const expiresMessage = getExpirationMessage(invitation.expiresAt);

  return (
    <li
      className='relative p-5 rounded-lg shadow-md border bg-white border-gray-200 transition-all duration-200 ease-in-out'
      onClick={() => !isRead && onMarkAsRead(invitation.id)}
    >
      {!isRead && (
        <div className='absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full'></div>
      )}

      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-bold text-gray-800'>New Invitation</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(invitation.id);
          }}
          className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition'
          title='Delete'
        >
          <IoMdTrash size={20} className='text-gray-600' />
        </button>
      </div>

      <ul className='text-sm space-y-2 pl-5 list-disc text-gray-800'>
        <li>
          <span className='font-semibold'>Inviter:</span>{' '}
          {invitation.inviterEmail}
        </li>
        <li>
          <span className='font-semibold'>Session:</span>{' '}
          {invitation.session?.name}
        </li>
        <li>
          <span className='font-semibold'>Role:</span> {invitation.role}
        </li>
      </ul>

      <div className='flex items-center justify-between mt-4'>
        <div className='text-sm text-gray-600'>
          <p>{receivedMessage}</p>
          {expiresMessage && <p>{expiresMessage}</p>}
        </div>
        {!isExpired ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept(invitation.id);
            }}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm transition'
          >
            Accept
          </button>
        ) : (
          <p className='text-sm italic text-gray-500'>
            This invitation has expired and can only be deleted.
          </p>
        )}
      </div>
    </li>
  );
};

export default NotificationItem;
