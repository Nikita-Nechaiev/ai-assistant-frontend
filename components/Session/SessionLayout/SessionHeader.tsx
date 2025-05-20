'use client';
import React, { useState } from 'react';

import { useRouter, useParams } from 'next/navigation';
import { FcInvite } from 'react-icons/fc';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { MdDelete, MdEdit } from 'react-icons/md';

import { ICollaborator } from '@/models/models';
import { PermissionEnum } from '@/models/enums';
import RequirePermission from '@/helpers/RequirePermission';
import ConfirmationModal from '@/ui/ConfirmationModal';
import TruncatedText from '@/ui/TruncateText';
import UserAvatarCircle from '@/components/common/UserAvatarCircle';

interface SessionHeaderProps {
  sessionName: string;
  collaborators: ICollaborator[];
  handleOpenInviteModal: () => void;
  timeSpent: number;
  changeSessionName: (name: string) => void;
  changeUserPermissions: (userId: number, permission: PermissionEnum) => void;
  deleteSession: () => void;
}

const formatTimeSpent = (timeSpent: number): string => {
  const hours = Math.floor(timeSpent / 3600);
  const minutes = Math.floor((timeSpent % 3600) / 60);
  const seconds = timeSpent % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

const SessionHeader: React.FC<SessionHeaderProps> = ({
  deleteSession,
  sessionName,
  collaborators,
  handleOpenInviteModal,
  timeSpent,
  changeUserPermissions,
  changeSessionName,
}) => {
  const router = useRouter();
  const params = useParams();

  const handleGoBack = () => {
    if (params.id && params.documentId) {
      router.push(`/session/${params.id}`);
    } else {
      router.push('/dashboard');
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [newSessionName, setNewSessionName] = useState(sessionName);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

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
          onClick={handleGoBack}
          className='flex items-center justify-center h-10 w-10 rounded-full bg-mainLight text-mainDark hover:bg-gray-200 transition'
        >
          <RiArrowGoBackFill />
        </button>

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
            <h1 className='text-xl flex items-center'>
              <TruncatedText text={sessionName} maxLength={55} className='text-mainLight font-semibold' />
            </h1>
          )}
          <RequirePermission permission={PermissionEnum.ADMIN}>
            <div className='flex items-center space-x-4'>
              <button onClick={() => setIsEditing(true)} className='text-mainLight hover:text-gray-300 transition'>
                <MdEdit size={25} />
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className='text-mainLight hover:text-gray-300 transition'
              >
                <MdDelete size={25} />
              </button>
            </div>
          </RequirePermission>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex -space-x-2'>
          {displayedCollaborators.map((collaborator) => (
            <UserAvatarCircle
              userId={collaborator.id}
              currentPermission={collaborator.permissions[collaborator.permissions.length - 1]}
              changeUserPermissions={changeUserPermissions}
              isYellow={true}
              isBelowTooltip={true}
              email={collaborator.email}
              key={collaborator.id}
              name={collaborator.name}
              avatar={collaborator.avatar}
            />
          ))}
          {hasMoreCollaborators && <span className='text-sm font-medium'>...</span>}
        </div>

        <RequirePermission permission={PermissionEnum.EDIT}>
          <button
            onClick={handleOpenInviteModal}
            className='h-10 w-10 bg-mainLight text-mainDark rounded-full flex items-center justify-center hover:bg-gray-200 transition'
          >
            <FcInvite />
          </button>
        </RequirePermission>

        <div className='text-lg font-semibold'>{formatTimeSpent(timeSpent)}</div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSubmit={() => {
          deleteSession();
          setDeleteModalOpen(false);
        }}
        onCancel={() => setDeleteModalOpen(false)}
        description='Are you sure you want to delete this session? This action cannot be undone.'
        submitText='Delete'
      />
    </header>
  );
};

export default SessionHeader;
