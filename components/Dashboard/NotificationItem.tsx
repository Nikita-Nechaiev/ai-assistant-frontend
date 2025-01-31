'use client';

import React from 'react';
import { IInvitation } from '@/models/models';
import { NotificationStatusEnum } from '@/models/enums';
import { IoMdTrash, IoMdCheckmark } from 'react-icons/io';
import { IoMailUnreadOutline } from 'react-icons/io5';

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
  const isExpired =
    invitation.expiresAt && new Date(invitation.expiresAt) < new Date();

  const formatDate = (date: Date | null): string =>
    date
      ? new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        }).format(new Date(date))
      : 'Unknown';

  const handleClick = () => {
    if (invitation.notificationStatus === NotificationStatusEnum.READ) {
      return
    }
    onMarkAsRead(invitation.id);
  };

  const sessionName = invitation.session?.name;

  return (
    <li
      className={`p-5 rounded-lg shadow-md border ${
        isExpired
          ? 'bg-red-50 border-red-200 text-gray-700'
          : isRead
          ? 'bg-gray-50 border-gray-200'
          : 'bg-blue-100 border-blue-300 hover:bg-blue-200'
      } transition-all duration-200 ease-in-out`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3
          className={`text-lg font-bold ${
            isExpired
              ? 'text-red-700'
              : isRead
              ? 'text-gray-700'
              : 'text-blue-700'
          }`}
        >
          New Invitation
        </h3>
        <div className='flex gap-3'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(invitation.id);
            }}
            className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition'
            disabled={isRead}
            title='Mark as Read'
          >
            <IoMailUnreadOutline size={20} className='text-gray-600' />
          </button>
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
      </div>

      {/* Main Content */}
      <ul className='text-sm space-y-2 pl-5 list-disc text-gray-800'>
        <li>
          <span className='font-semibold'>Inviter:</span>{' '}
          {invitation.inviterEmail}
        </li>
        <li>
          <span className='font-semibold'>Session:</span> {sessionName}
        </li>
        <li>
          <span className='font-semibold'>Role:</span> {invitation.role}
        </li>
        <li>
          <span className='font-semibold'>Created on:</span>{' '}
          {formatDate(invitation.date)}
        </li>
        <li>
          <span className='font-semibold'>Expires on:</span>{' '}
          {formatDate(invitation.expiresAt)}
        </li>
      </ul>

      {/* Buttons */}
      {!isExpired && (
        <div className='flex gap-4 mt-4 justify-end'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept(invitation.id);
            }}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm transition'
          >
            Accept
          </button>
        </div>
      )}

      {isExpired && (
        <p className='mt-4 text-sm italic text-gray-500'>
          This invitation has expired and can only be deleted.
        </p>
      )}
    </li>
  );
};

export default NotificationItem;
