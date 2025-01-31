'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserAvatarCircle from '../common/UserAvatarCircle';
import { FcInvite } from 'react-icons/fc';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { MdEdit } from 'react-icons/md';
import { ICollaborator } from '@/models/models';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';

interface SessionHeaderProps {
  sessionName: string;
  collaborators: ICollaborator[];
  handleOpenInviteModal: () => void;
  timeSpent: number;
  changeSessionName: (name: string) => void;
  changeUserPermissions: (userId: number, permission: PermissionEnum) => void;
}

const formatTimeSpent = (timeSpent: number): string => {
  const hours = Math.floor(timeSpent / 3600);
  const minutes = Math.floor((timeSpent % 3600) / 60);
  const seconds = timeSpent % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

const SessionHeader: React.FC<SessionHeaderProps> = ({
  sessionName,
  collaborators,
  handleOpenInviteModal,
  timeSpent,
  changeUserPermissions,
  changeSessionName,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newSessionName, setNewSessionName] = useState(sessionName);

  const handleSave = () => {
    if (newSessionName.trim()) {
      changeSessionName(newSessionName);
      setIsEditing(false);
    }
  };

  const displayedCollaborators = collaborators.slice(0, 10);
  const hasMoreCollaborators = collaborators.length > 10;

  return (
    <header className='z-50 flex items-center justify-between px-6 bg-mainDark text-mainLight shadow-md fixed w-full h-[72px]'>
      <div className='flex items-center space-x-4'>
        <button
          onClick={() => router.back()}
          className='flex items-center justify-center h-10 w-10 rounded-full bg-mainLight text-mainDark hover:bg-gray-200 transition'
        >
          <RiArrowGoBackFill />
        </button>

        {/* Editable Session Name */}
        <div className='flex items-center space-x-5'>
          {isEditing ? (
            <input
              type='text'
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className='bg-mainLight text-mainDark px-2 py-1 rounded focus:outline-none'
            />
          ) : (
            <h1 className='text-xl font-semibold'>{sessionName}</h1>
          )}
          <RequirePermission permission={PermissionEnum.ADMIN}>
            <button
              onClick={() => setIsEditing(true)}
              className='text-mainLight hover:text-gray-300 transition'
            >
              <MdEdit size={25} />
            </button>
          </RequirePermission>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex -space-x-2'>
          {displayedCollaborators.map((collaborator) => (
            <UserAvatarCircle
              userId={collaborator.id}
              currentPermission={
                collaborator.permissions[collaborator.permissions.length - 1]
              }
              changeUserPermissions={changeUserPermissions}
              isYellow={true}
              isBelowTooltip={true}
              email={collaborator.email}
              key={collaborator.id}
              name={collaborator.name}
              avatar={collaborator.avatar}
            />
          ))}
          {hasMoreCollaborators && (
            <span className='text-sm font-medium'>...</span>
          )}
        </div>

        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            onClick={handleOpenInviteModal}
            className='h-10 w-10 bg-mainLight text-mainDark rounded-full flex items-center justify-center hover:bg-gray-200 transition'
          >
            <FcInvite />
          </button>
        </RequirePermission>

        {/* Time Spent */}
        <div className='text-lg font-semibold'>
          {formatTimeSpent(timeSpent)}
        </div>
      </div>
    </header>
  );
};

export default SessionHeader;
